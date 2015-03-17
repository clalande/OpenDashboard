(function(angular) {
//'use strict';
    
angular
.module('od.cards.demo', ['OpenDashboardRegistry', 'OpenDashboardAPI'])
 .config(function(registryProvider){
    registryProvider.register('demo',{
        title: 'Sankey Diagram Card',
        description: 'This card demonstrates how to use a sankey diagram.',
        imgUrl: '',
        cardType: 'demo',
        styleClasses: 'od-card col-xs-12',
	    config: [
	    ]
    });
 })

	.directive('sankeyDiagram2', function ($parse) {
		//explicitly creating a directive definition variable
		//this may look verbose but is good for clarification purposes
		//in real life you'd want to simply return the object {...}
		var directiveDefinitionObject = {
			//We restrict its use to an element
			//as usually  <bars-chart> is semantically
			//more understandable
			restrict: 'E',
			//this is important,
			//we don't want to overwrite our directive declaration
			//in the HTML mark-up
			replace: false,
			scope: {data: '=chartData'},
			link: function (scope, element, attrs) {
				//converting all data passed thru into an array
				var data = attrs.chartData.split(',');


				var units = "Widgets";

				var margin = {top: 10, right: 10, bottom: 10, left: 10},
					width = 1000 - margin.left - margin.right,
					height = 400 - margin.top - margin.bottom;

				var formatNumber = d3.format(",.0f"),    // zero decimal places
					format = function(d) { return formatNumber(d) + " " + units; },
					color = d3.scale.category20();

				// append the svg canvas to the page
				var svg = d3.select("#chart").append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
					.append("g")
					.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");

				// Set the sankey diagram properties
				var sankey = d3.sankey()
					.nodeWidth(36)
					.nodePadding(10)
					.size([width, height]);

				var path = sankey.link();

				// Show sankey diagram data

				d3.json("jsonFile", function(error, graph) {

					var event1 = {name_full: "George", action:"took", object:"Quiz1"};
					var event2 = {name_full: "Tom", action:"read", object: "Reading1"};
					var event3 = {name_full: "Tom", action:"took", object: "Quiz1"};
					var event4 = {name_full: "Bill", action:"read", object: "Reading1"};


					var events = [];
					events.push(event1);
					events.push(event2);
					events.push(event3);
					events.push(event4);

					console.log("events:" + JSON.stringify(events));

					var last_event= null;
					var nodes = [];
					var segments = [];
					var links = [];
					var found_node = false;
					var found_segment = false;

					for (i = 0; i < events.length; i++) {
						console.log("evt.object:" + events[i].object);
						found_node = false;
						// Construct nodes
						for (j = 0; j < nodes.length; j++) {
							if (nodes[j].name == events[i].object) {
								found_node = true;
							}
						}
						if (found_node == false) {
							var new_node = {name: events[i].object };
							console.log("new node:" + JSON.stringify(new_node));
							nodes.push(new_node);

						}

						// Construct links

						for (k = 0; k < segments.length; k++) {
						    last_event = null;

							// step through prior events to look for most recent by user
							for (l = k; l >=0; l-- )
							{
								if (events[l].full_name == events[i].full_name) {
									last_event = events[l];
									break;
								}

							}

							if (segments[k].source == last_event.object && segments[k].target == events[i].object ) {
								found_segment = true;
								if (!segments[k].value)
								    segments[k].value = 1;
								else
									segments[k].value = segments[k].value + 1;
							}

						}
						if (found_segment == false) {
							if (!last_event) {
								var new_segment = {user: events[i].full_name, source: "start", target: events[i].object, value: 1};
								segments.push(new_segment);
							} else
							{
								var new_segment = {user: events[i].full_name, source: last_event.object, target: events[i].object, value:1};
								segments.push(new_segment);
							}
						}


						//last_event[events[i].full_name] = events[i];
					}

					console.log("Nodes:" + JSON.stringify(nodes));
					console.log("Segments:" + JSON.stringify(segments));

					nodesJson = JSON.stringify(nodes);
					linksJson =  JSON.stringify(segments);

					//var jsonString =  '{ "nodes": ' + nodesJson + ', "links":' + linksJson + '}';

					console.log("json: " + jsonString);

					var jsonString =  '{ "nodes": [{"name":"Activity1"}, {"name":"Reading1"}, {"name":"Activity2"}, {"name":"Forum1"}, {"name":"Quiz1"}], "links": [{"source":"Activity1","target":"Reading1","value":2}, {"source":"Reading1","target":"Activity2","value":2}, {"source":"Activity1","target":"Activity2","value":2}, {"source":"Reading1","target":"Forum1","value":2}, {"source":"Activity2","target":"Quiz1","value":2}, {"source":"Activity2","target":"Forum1","value":2}, {"source":"Reading1","target":"Quiz1","value":4} ] }';

					//console.log("good json: " + jsonString2);


					var graph = JSON.parse(jsonString);

					var nodeMap = {};
					graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
					graph.links = graph.links.map(function(x) {
						return {
							source: nodeMap[x.source],
							target: nodeMap[x.target],
							value: x.value
						};
					});

					/*sankey
						.nodes(graph.nodes)
						.links(graph.links)
						.layout(32); */


					// add in the links
					var link = svg.append("g").selectAll(".link")
						.data(graph.links)
						.enter().append("path")
						.attr("class", "link")
						.attr("d", path)
						.style("stroke-width", function(d) { return Math.max(1, d.dy); })
						.sort(function(a, b) { return b.dy - a.dy; });

					// add the link titles
					link.append("title")
						.text(function(d) {
							return d.source.name + " → " +
								d.target.name + "\n" + format(d.value); });

					// add in the nodes
					var node = svg.append("g").selectAll(".node")
						.data(graph.nodes)
						.enter().append("g")
						.attr("class", "node")
						.attr("transform", function(d) {
							return "translate(" + d.x + "," + d.y + ")"; })
						.call(d3.behavior.drag()
							.origin(function(d) { return d; })
							.on("dragstart", function() {
								this.parentNode.appendChild(this); })
							.on("drag", dragmove));

					// add the rectangles for the nodes
					node.append("rect")
						.attr("height", function(d) { return d.dy; })
						.attr("width", sankey.nodeWidth())
						.style("fill", function(d) {
							return d.color = color(d.name.replace(/ .*/, "")); })
						.style("stroke", function(d) {
							return d3.rgb(d.color).darker(2); })
						.append("title")
						.text(function(d) {
							return d.name + "\n" + format(d.value); });

					// add in the title for the nodes
					node.append("text")
						.attr("x", -6)
						.attr("y", function(d) { return d.dy / 2; })
						.attr("dy", ".35em")
						.attr("text-anchor", "end")
						.attr("transform", null)
						.text(function(d) { return d.name; })
						.filter(function(d) { return d.x < width / 2; })
						.attr("x", 6 + sankey.nodeWidth())
						.attr("text-anchor", "start");

					// the function for moving the nodes
					function dragmove(d) {
						d3.select(this).attr("transform",
							"translate(" + (
								d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
							) + "," + (
								d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
							) + ")");
						sankey.relayout();
						link.attr("d", path);
					}
				});
			}
		};
		return directiveDefinitionObject;
	})

 .controller('DemoCardController', function($scope, $log, ContextService, RosterService, OutcomesService, DemographicsService) {
	
	$scope.course = ContextService.getCourse();
	$scope.lti = ContextService.getInbound_LTI_Launch();

	if ($scope.lti.ext.ext_ims_lis_memberships_url && $scope.lti.ext.ext_ims_lis_memberships_id) {
		
		var basicLISData = {};
		basicLISData.ext_ims_lis_memberships_url = $scope.lti.ext.ext_ims_lis_memberships_url;
		basicLISData.ext_ims_lis_memberships_id = $scope.lti.ext.ext_ims_lis_memberships_id;
		
		var options = {};
		options.contextMappingId = $scope.contextMapping.id;
		options.dashboardId = $scope.activeDashboard.id;
		options.cardId = $scope.card.id;
		options.basicLISData = basicLISData;

		RosterService
		.getRoster(options,null) // pass null so the default implementation is used
		.then(
			function (rosterData) {
				if (rosterData) {
					$scope.course.buildRoster(rosterData);					
				}
			}
		);
		
		OutcomesService
		.getOutcomes(options,null)
		.then(
			function(outcomesData) {
				$scope.outcomes = outcomesData;
			}
		);
		
		DemographicsService
		.getDemographics()
		.then(
			function (demographicsData) {
				$scope.demographics = demographicsData;
			}
			
		);

	}
	else {
		$log.error('Card not configured for Roster');
		$scope.message = 'No supporting roster service available';
	}
});

	/* Don't need this for now. Would let us do a more angular-y way of pushing data to view
	function Ctrl($scope) {
		$scope.myData = [10,20,30,40,60];
	} */

})(angular);
