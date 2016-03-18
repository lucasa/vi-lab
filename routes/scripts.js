
/*
todo:

- phasenübergänge:
-- schedule .. exact date/time, rythm, e.g. 2 day
-- condition .. #contributions, #taks-solutions, #word-count, ...

*/

var 
	mongoose = require( 'mongoose' ),
	server =  require('../server'),
	videos =  require('./videos'),
	Scripts  = mongoose.model( 'Scripts' ),
	Templates = mongoose.model('ScriptTemplate'),
	Instances = mongoose.model('ScriptInstance'),
	Groups = mongoose.model('Groups'),
	Users = mongoose.model('Users'),
	fs = require('node-fs'),
	csv = require('csv')
	;


/*
 *
 **/
exports.renderIndex = function(req, res) { 
	res.render( 'admin/scripts', { });
	res.end('done');
};






/*******************************************************/
/* SCRIPT TEMPLATES */

var templateA = {
	title : "PAPA Script",
	description : "A script for peer annotations and peer assessment",
	tags : ["E-Assessment","Tests","Video-Annotation","Video-Assessment"],
  slides : true,
	phases: [
    		{ 
    			title: "Phase 1",
    			instruction: "Legen Sie dies und das an",
    			supplements: "themenblock",
    			seq : 0,
    			groupindex: 0, 
    			widgets: [ 
    				{ label: 'Table of Contents',
    					name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		widget_options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ label: 'Comments',
							name: 'comments', 
							canBeAnnotated:true, 
		  		 		widget_options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	}
    			]	
    		}, // phase 2
    		{ 
    			title: "Phase 2",
    			instruction: "Machen Sie mal was",
    			supplements: "This and that",
    			seq : 0,
    			groupindex: 0, 
    			widgets: [ 
    				{ label: 'Comments',
    					name: 'comments', 
							canBeAnnotated:true, 
		  		 		widget_options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	}
    			]	
    		}
    	]
}

//
var t = new Date();
templateA.created_at = t.getTime();
templateA.updated_at = t.getTime();


/*
* Add new Template as an example
**/
exports.addTemplate = function(req, res) { 
	Templates.remove(function(err, o){
  	if(err){
  		console.log(err)
  	}else{
  	
  	new Templates( templateA )
		.save( function( err, template, count ){
			console.log( 'eeeeeee '+template.title )
			//res.redirect( '/temp' );
			//res.end();
		});
		
		}})
}	


      
/*
 * List all script templates
 * status: finished
 **/
exports.renderTemplates = function(req, res) { 
	Templates.find({}).exec(function (err, templates) {
		if(err){ 
			console.log(err); 
		}else{ 
			res.render( 'admin/scripts-template-index', {
				items : templates
			});
			res.end('done');
		}	
	});
};
    
  
/*
 * Get script template by ID
 * status: finished
 **/
exports.renderTemplateByID = function(req, res) { 
	Templates.find({_id: req.params.id}).lean().exec(function (err, template) {
		if(err){ 
			console.log(err); 
		}else{
			res.render( 'admin/scripts-template-edit', {
				items : template[0]
			});
			res.end('done');
		}	
	});
};

	
/*
 * Duplicates a script template
 * status: finished
 **/
exports.duplicateTemplateByID = function(req, res) {
	Templates.find({_id: req.params.id}).lean().exec(function (err, template) {
		if(err){ 
			console.log(err); 
		}else{
			var template2 = template;//clone(template);
			template2[0].title = template2[0].title + '-' + Math.floor(Math.random()*100);
			delete template2[0]["_id"];
			new Templates( template2[0] )
				.save( function( err, newtemplate, count ){
					if(err){ console.log(err); }
					console.log( 'Duplicated Script Template ' + newtemplate.title )
					res.redirect( '/admin/scripts/templates' );
				});
			
		}	
	});
}	





/*
 * Update Template
 * status: finished
 **/
exports.updateTemplateByID = function(req, res) { console.log(req.body.phases[0].video_files);
	Templates.findOneAndUpdate(req.params.id, req.body, function ( err, template ){
		res.end()
	});
}


/*
* Removes a Template
* status: finished
**/
exports.destroyTemplateByID = function(req, res) {
	Templates.findById( req.params.id, function ( err, template ){
	  template.remove( function ( err, template ){
	    res.redirect( '/admin/scripts/templates' );
	    res.end('done');
	 	});
	});
}


/*
 * Instatiates a script template for associating groups, times, etc.
 **/	
exports.instantiateTemplateByID = function(req, res) {
	Templates.findById( req.params.id, function ( err, template ){
		var 
			t = new Date(),
			script = {
				title : template.title+'_instance',
				template : template._id,
				phases: [],
				created_at 	: t.getTime(),
				status : 'drafted',
				current_phase : 0,
			};
	  // prepare phases
	  for(var i = 0; i < template.phases.length; i++){
  		script.phases[i] = template.phases[i];
  		script.phases[i].start = t.getTime();
			script.phases[i].seq = i;
  		script.phases[i].groupindex = undefined;
  		script.phases[i].groupformation = undefined;
	  }

	  console.log(script);
	  new Instances( script ).save(function(err, instance){
	  	if(err){ 
	  		console.log(err)
	  	}else{
				console.log('-----------------')
				console.log(instance)
			  res.redirect( '/admin/scripts/instances' );
			  res.end('done');
	    }
	  });  
	 	
	});
}




/*************************************************/
/* SCRIPT INSTANCES */

/*
 * List all script instances
 * status: finished
 **/
exports.renderInstances = function(req, res) { 
	Instances.find({}).exec(function (err, instances) {
		if(err){ 
			console.log(err); 
		}else{  console.log(instances)
			res.render( 'admin/scripts-instances-index', {
				items : instances
			});
			res.end('done');
		}	
	});
};


/*
 * Get JSON of all script instances
 **/
exports.getInstances = function(req, res) {
	Instances.collection.find().toArray(function(err, items) {
    	res.type('application/json');
		 	res.jsonp(items); 
		});
};


/*
 * Renders an instance of a script for editing
 * status: finished
 **/
exports.renderInstanceByID = function(req, res) { 
	Instances.find({_id: req.params.id}).lean().exec(function (err, instance) {
		if(err){ 
			console.log(err); 
		}else{
			res.render( 'admin/scripts-instances-edit', {
				items : instance[0]
			});
			res.end('done');
		}	
	});
};


/*
 *
 **/
exports.activateInstanceByID = function(req, res){
	Instances.update({ '_id':req.params.id}, { status: 'running' }, function ( err, instance ){
		if(err){
			console.log(err)
		}else{
			console.log('set Instance active'); //console.log(instance);
			res.redirect('/admin/scripts/instances');
			res.end();
		}
	});	
}

/*
 * Saves an script instance to the database. Furthermore it prepares the script for being interpretet in the run-time environment
 * status
 **/
exports.updateInstanceByID = function(req, res){
	Groups.remove({}, function ( err, ggg ){});
	// save instance
	delete req.body["_id"];
	Instances.findOneAndUpdate(req.params.id, req.body, function ( err, instance ){
		if(err){
			console.log(err)
		}
		
		// get group formation
		var allFormations = [];
		for(var i = 0; i < instance.phases.length; i++){
			allFormations.push( instance.phases[i].groupformation );
		}
		
		// define groups considering the video files and group formations
		// build inverted index
		
		var Formations = mongoose.model( 'GroupFormations' );		
		Formations.find( {'_id': { $in: allFormations }}, function ( err, docs ){
			if(err){ console.log(err); 
			}else{
				var 
					user_index = {},
					video_id = 1,
					getFormation = function(p){
						for(var d=0; d < docs.length;d++){ 
							if(String(docs[d]._id) === String(allFormations[p])){ 
								return docs[d].formation;
							}
						}
					}
					;	
				Videos.remove({}, function ( err, ggg ){		
				// iterate phases
				for(var p=0; p < instance.phases.length; p++){
					var f = getFormation(p);
					//Groups.remove({}, function ( err, ggg ){
					
						// iterate groups 
						var group_id = 1;
						for(var i=0; i < f.length; i++){
							// generate video instances
							var 
								files = instance.phases[p].video_files,
								video_ids = []
								;
							for(var l = 0; l < files.length; l++){
								video_ids[l] = video_id;
								video_id++;
							}	//console.log(video_ids)
							videos.createMultipleFileInstance(files, video_ids);
							// new group
							var group = {
								id: String.fromCharCode(96 + group_id)+''+p,
								description: 'phase_'+p+'__group_'+i,
								phase: p,
								persons: f[i].length, // number of persons
								videos : video_ids
							};
						
							// save group
							new Groups( group ).save();
							// create index of users in a group
							for(var j=0; j < f[i].length; j++){
								if( f[i][j].id in user_index === false){
									user_index[f[i][j].id] = []; // i=group; j=user
								}
								user_index[f[i][j].id].push( String.fromCharCode(96 + group_id)+''+p )  
							}
							group_id++;
						}//end for groups
				
				}// end for phases
		
				// update users with the new group-indexs
				// console.log(user_index);
				var 
					configs = {},
					async = require('async')
					;
				async.forEachOf(user_index, function (value, key, callback) {
						Users.update({id: key}, {groups: value} ,function (err, user) {
							if(err){ 
								console.log('@user_update'); console.log(err); 
							}else{
								console.log('updated group for user')
								//configs[key] = user; // collect results
							}
						});	
					}, function (err) {
							if (err){ console.log('@user_update2'); console.error(err.message); }
							//console.log(configs); // so something with the results
							console.log('updated instance')
							res.redirect( '/admin/scripts/instances' );
							res.end()
				});// end async	
			});// end videos remove	
			}	
		}); // end formations find
	});	// end instance update
}


/*
* Removes a script instance
* status: finished
**/
exports.destroyInstanceByID = function(req, res) {
	Instances.findById( req.params.id, function ( err, instance ){
	  instance.remove( function ( err, instance ){
	    res.redirect( '/admin/scripts/instances' );
	    res.end('done');
	 	});
	});
}



/*************************************************/
/* SCRIPT MODELING*/


/*
 * status: deprecated xxx
 **/
exports.getScriptInfo = function ( req, res ){ // xxx editor
	Scripts.find({}).exec( function ( err, scripts ){
		Groups.find({}).exec( function( err, groups){
			Videos.find({}).select('id metadata video').exec( function( err, videos ){
				if(err){ 
					console.log(err); 
				}else{
					res.type('application/json');
					res.jsonp( {
						scripts : scripts,
						groups : groups,
						videos:	videos
					});
					res.end('done');
				}	
			}); // end video
		});// end group
	});//end script	
}



















/**********************************************/
/* STATIC SCRIPT */

 /*
 
 **/
 exports.importScript = function(){
 
 
 
 		return;
 		
 		
    var script = 
    {
    	current_phase : 5,
    	slides : false,
    	phases: [
    		{ /* Phase 0 */
    			title: "Anlaufphase",
    			instruction: "(keine)",
    			seq : 4,
    			groupindex: 0,
    			start : {
    				year: '2015',
    				month: '10',
    				day: '17',
    				h: '0',
    				m: '15'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	}
		  		]	
    		},
    		{ /* Phase 1 */
    			title: "Phase 1 - Auftakt",
    			instruction: "<p>Bitte schauen Sie sich das Video aufmerksam an. Sie arbeiten in der ersten Phase in einer Gruppe von vier Personen. Erstellen Sie gemeinsam ein Inhaltsverzeichnis und betten Sie sinnvolle Links zu weiterführenen Lernmaterialien in das Video ein. Jeder in der Gruppe ist zudem aufgefordert, sinnvolle und nicht zu leichte Überprüfungsfragen für die übrigen Gruppenmitglieder im Video zu verankern. Außerdem sollen Sie die von den anderen Gruppenmitgliedern definierten Testfragen/-aufgaben selbst bearbeiten/lösen. <br> Mit Hilfe der Kommentare können Sie sich untereinander austauschen.</p><p>Um Ihr gelerntes Wissen darüber hinaus zu überprüfen, steht Ihnen ein <a href='/assessment'>Selbsttest</a> zur Verfügung. Die Fragen dieses Tests sollten Sie jedoch nicht in das Video übertragen.</p>",
    			seq : 0,
    			groupindex: 0,
    			start : {
    				year: '2015',
    				month: '10',
    				day: '22',
    				h: '23',
    				m: '00'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},	
	  		 		{ name: 'hyperlinks', 
							canBeAnnotated:true, 
					 		options: {
					 			displaySelector: '#overlay',
					 			hasTimelineMarker: true,
					 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#hyperlinks',
								minDuration: 5, // seconds
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
					 		}
					 	},	
					 	{ name: 'assessment', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#assessment',
								allowComments : true,
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},
		  		 	{ 
		  		 		name: 'syncMedia', 
							canBeAnnotated:true,
							options: { 
						 		selector: '#seq', 
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								controls: true, 
								hasMenu: false,
								menuSelector:'.synMediaMenu',
								prefix_path: '/static/slides/', 
								sync: true, 
								placeholder:'/static/img/placeholder.jpg'
							}	
		  		 	}
		  		]	
    		}, // end phase 
    		{ /* Phase 2 */
    			title: "Phase 2 - Kommunikation und Kommunikationsmedien im virtuellen Raum",
    			instruction: "<p>Bitte schauen Sie sich das Video aufmerksam an. Sie arbeiten in der ersten Phase in einer Gruppe von vier Personen. Erstellen Sie gemeinsam ein Inhaltsverzeichnis und betten Sie sinnvolle Links zu weiterführenen Lernmaterialien in das Video ein. Jeder in der Gruppe ist zudem aufgefordert, sinnvolle und nicht zu leichte Überprüfungsfragen für die übrigen Gruppenmitglieder im Video zu verankern. Außerdem sollen Sie die von den anderen Gruppenmitgliedern definierten Testfragen/-aufgaben selbst bearbeiten/lösen. <br> Mit Hilfe der Kommentare können Sie sich untereinander austauschen.</p>",
    			seq : 2,
    			groupindex: 2,
    			start : {
    				year: '2015',
    				month: '10',
    				day: '29',
    				h: '23',
    				m: '30'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},	
	  		 		{ name: 'hyperlinks', 
							canBeAnnotated:true, 
					 		options: {
					 			displaySelector: '#overlay',
					 			hasTimelineMarker: true,
					 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#hyperlinks',
								minDuration: 5, // seconds
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
					 		}
					 	},	
					 	{ name: 'assessment', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#assessment',
								allowComments : true,
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},
		  		 	{ 
		  		 		name: 'syncMedia', 
							canBeAnnotated:true,
							options: { 
						 		selector: '#seq', 
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								controls: true, 
								hasMenu: false,
								menuSelector:'.synMediaMenu',
								prefix_path: '/static/slides/', 
								sync: true, 
								placeholder:'/static/img/placeholder.jpg'
							}	
		  		 	}
		  		]	
    		}, // end phase 
    		{ /* Phase 3 */
    			title: "Phase 3 - Arbeiten und Lernen in Gruppen",
    			instruction: "<p>Bitte schauen Sie sich das Video aufmerksam an. Sie arbeiten in der ersten Phase in einer Gruppe von vier Personen. Erstellen Sie gemeinsam ein Inhaltsverzeichnis und betten Sie sinnvolle Links zu weiterführenen Lernmaterialien in das Video ein. Jeder in der Gruppe ist zudem aufgefordert, sinnvolle und nicht zu leichte Überprüfungsfragen für die übrigen Gruppenmitglieder im Video zu verankern. Außerdem sollen Sie die von den anderen Gruppenmitgliedern definierten Testfragen/-aufgaben selbst bearbeiten/lösen. <br> Mit Hilfe der Kommentare können Sie sich untereinander austauschen.</p>",
    			seq : 3,
    			groupindex: 3,
    			start : {
    				year: '2015',
    				month: '11',
    				day: '5',
    				h: '23',
    				m: '30'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},	
	  		 		{ name: 'hyperlinks', 
							canBeAnnotated:true, 
					 		options: {
					 			displaySelector: '#overlay',
					 			hasTimelineMarker: true,
					 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#hyperlinks',
								minDuration: 5, // seconds
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
					 		}
					 	},	
					 	{ name: 'assessment', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#assessment',
								allowComments : true,
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},
		  		 	{ 
		  		 		name: 'syncMedia', 
							canBeAnnotated:true,
							options: { 
						 		selector: '#seq', 
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								controls: true, 
								hasMenu: false,
								menuSelector:'.synMediaMenu',
								prefix_path: '/static/slides/', 
								sync: true, 
								placeholder:'/static/img/placeholder.jpg'
							}	
		  		 	}
		  		]	
    		}, // end phase 
    		{ /* Phase 4 */
    			title: "Phase 4 - Moderation und Arbeitsstrukturierung im VCL-Projekt",
    			instruction: "<p>Bitte schauen Sie sich das Video aufmerksam an. Sie arbeiten in der ersten Phase in einer Gruppe von vier Personen. Erstellen Sie gemeinsam ein Inhaltsverzeichnis und betten Sie sinnvolle Links zu weiterführenen Lernmaterialien in das Video ein. Jeder in der Gruppe ist zudem aufgefordert, sinnvolle und nicht zu leichte Überprüfungsfragen für die übrigen Gruppenmitglieder im Video zu verankern. Außerdem sollen Sie die von den anderen Gruppenmitgliedern definierten Testfragen/-aufgaben selbst bearbeiten/lösen. <br> Mit Hilfe der Kommentare können Sie sich untereinander austauschen.</p>",
    			seq : 4,
    			groupindex: 4,
    			start : {
    				year: '2015',
    				month: '11',
    				day: '12',
    				h: '23',
    				m: '30'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},	
	  		 		{ name: 'hyperlinks', 
							canBeAnnotated:true, 
					 		options: {
					 			displaySelector: '#overlay',
					 			hasTimelineMarker: true,
					 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#hyperlinks',
								minDuration: 5, // seconds
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
					 		}
					 	},	
					 	{ name: 'assessment', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#assessment',
								allowComments : true,
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},
		  		 	{ 
		  		 		name: 'syncMedia', 
							canBeAnnotated:true,
							options: { 
						 		selector: '#seq', 
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								controls: true, 
								hasMenu: false,
								menuSelector:'.synMediaMenu',
								prefix_path: '/static/slides/', 
								sync: true, 
								placeholder:'/static/img/placeholder.jpg'
							}	
		  		 	}
		  		]	
    		}, // end phase 
    		{ /* Phase 5 */
    			title: "Phase 5 - Konfliktdiagnostik und -intervention im virtuellen Klassenraum",
    			instruction: "<p>Bitte schauen Sie sich das Video aufmerksam an. Sie arbeiten in der ersten Phase in einer Gruppe von vier Personen. Erstellen Sie gemeinsam ein Inhaltsverzeichnis und betten Sie sinnvolle Links zu weiterführenen Lernmaterialien in das Video ein. Jeder in der Gruppe ist zudem aufgefordert, sinnvolle und nicht zu leichte Überprüfungsfragen für die übrigen Gruppenmitglieder im Video zu verankern. Außerdem sollen Sie die von den anderen Gruppenmitgliedern definierten Testfragen/-aufgaben selbst bearbeiten/lösen. <br> Mit Hilfe der Kommentare können Sie sich untereinander austauschen.</p>",
    			seq : 5,
    			groupindex: 5,
    			start : {
    				year: '2015',
    				month: '11',
    				day: '19',
    				h: '23',
    				m: '30'
    			}, 
    			widgets: [
		  		 	{ name: 'toc', 
		  		 		canBeAnnotated:true, 
		  		 		options: {
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								hasMenu : true,
								menuSelector: '#toc',
								allowEditing : true,
								allowCreation : true,
								path: '/static/img/user-icons/'
							} 
						},
						{ name: 'comments', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-bottom', 
								hasMenu : true,
								menuSelector: '#comments',
								allowReplies : true, // tipical for comments
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},	
	  		 		{ name: 'hyperlinks', 
							canBeAnnotated:true, 
					 		options: {
					 			displaySelector: '#overlay',
					 			hasTimelineMarker: true,
					 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#hyperlinks',
								minDuration: 5, // seconds
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
					 		}
					 	},	
					 	{ name: 'assessment', 
							canBeAnnotated:true, 
		  		 		options: {
		  		 			hasTimelineMarker: true,
		  		 			timelineSelector : '.vi2-timeline-top', 
								hasMenu : true,
								menuSelector: '#assessment',
								allowComments : true,
								allowEditing : true,
								allowCreation : true, 
								path: '/static/img/user-icons/'
		  		 		}
		  		 	},
		  		 	{ 
		  		 		name: 'syncMedia', 
							canBeAnnotated:true,
							options: { 
						 		selector: '#seq', 
								hasTimelineMarker: true, 
								timelineSelector : '.vi2-timeline-main',
								controls: true, 
								hasMenu: false,
								menuSelector:'.synMediaMenu',
								prefix_path: '/static/slides/', 
								sync: true, 
								placeholder:'/static/img/placeholder.jpg'
							}	
		  		 	}
		  		]	
    		} // end phase 
    	]
    };


    Scripts.remove(function(err, o){
    	if(err){
    		console.log(err)
    	}else{
        console.log("Removed script");
        new Scripts(script).save( function( err, todo, count ){
					if(err){
						console.log(err);
					}else{
						console.log("added script");
						//res.redirect( '/users' );
					}
				});;
     	}   
    });
};


/*
* 
* see also https://github.com/ncb000gt/node-cron
**/

exports.startScriptSession = function(){
	
	// start cron jobs for each job
	var now = new Date();
	var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

	var t = new Date();
	var inte = [1, 2, 3, 4]
	var tt = 0;

	for(var i=0; i < inte.length; i++){ 
		t.setSeconds(t.getSeconds() + inte[i]);
	
		var CronJob = require('cron').CronJob;
		var job = new CronJob( t, 
			function() { 
				tt++;
				console.log('start cron '+tt);
				//job.stop();
			}, 
			function () {
				console.log('fin cron');
			},
			true//, // Start the job right now /
		//  timeZone // Time zone of this job. /
		);
	}

}



/**
JSON
*/
exports.getScript = function(req, res) {
	Instances.find().exec(function(err, items) {
    	res.type('application/json');
    	res.jsonp(items);  //items is the object
    	
		 	var 
				date = new Date(), 
				p = 1;
			if(date.getMonth() == 11){
				switch(date.getDate()){
					case 5: p=0; break;
					case 6: p=0; break;
					case 7: p=0; break;
					case 8: p=1; break;
					case 9: p=1; break;
					case 10: p=2; break;
					case 11: p=2; break;
					case 12: p=3; break;
					default : p = 1;
				}
			}
      //items[0]['current_phase'] = p;
      console.log('PHASE == ' + p);
    	//res.jsonp(items);  //items is the object
		});
};




/* 
var schedule = require('node-schedule');
var date = new Date();
console.log(date.getYear()+'--'+date.getMonth()+'--'+date.getDay()+'--'+date.getHours()+':'+date.getMinutes());

 date = new Date(113, 11, 2, 23, 42, 0);
// 113--11--2--23:32

date=new Date();
date.setFullYear(2013,11,3,0,0,0);

var j = schedule.scheduleJob(date, function(){
	//var date = new Date();
	//console.log(date.getYear()+'--'+date.getMonth()+'--'+date.getDay()+'--'+date.getHours()+':'+date.getMinutes());
	console.log('....................The world is going to end today.');
});
*/

//var rule = new schedule.RecurrenceRule(); rule.second = 5;
//var jj = schedule.scheduleJob(rule, function(){
//    console.log('The answer to life, the universe, and everything!');
//});



/*************************************+/
/* UTILS */

// util to clone an object	
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}









