(function(angular) {
'use strict';
    
angular
.module('od.cards.pathways', ['OpenDashboardRegistry', 'OpenDashboardAPI'])
 .config(function(registryProvider){
    registryProvider.register('pathways',{
        title: 'Engagement Pathways',
        description: 'This card shows the pathways that students take through content.',
        imgUrl: '',
        cardType: 'pathways',
        styleClasses: 'od-card col-xs-12',
	    config: [
            {field:'url',fieldName:'OpenLRS URL',fieldType:'url',required:false},
            {field:'key',fieldName:'OpenLRS Key',fieldType:'text',required:false},
            {field:'secret',fieldName:'OpenLRS Secret',fieldType:'text',required:false}
	    ]
    });
 })
 .controller('PathwaysCardController', function($scope, $http, $log, _, ContextService, EventService, RosterService) {
	
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

        var handleLRSResponse = function (statements) {
            _.forEach(statements, function (statement) {
                $scope.course.addEvent(EventService.getEventFromService(statement));
            });
        }

            //assign events to users so that we can find individual paths
//            var eventsGroupByObject = _.groupBy($scope.course.events,function(event){ return event.object.id; });
//            _.forEach($scope.course.events, function (event) {
//
//                var objectEvents = eventsGroupByObject[event.object.id];
//
////                learner.events = learnerEvents;
//                var learnerTotal = objectEvents ? objectEvents.length : 0;
//                learner.relative_activity_level = learnerTotal;
//            });
//            }

//        if ($scope.isStudent) {
//            var userId = ContextService.getCurrentUser().user_id;
//            EventService.getEventsForUser($scope.contextMapping.id,$scope.activeDashboard.id,$scope.card.id,userId)
//                .then(handleLRSResponse);
//        }
//        else {
//            RosterService
//                .getRoster(options, null)
//                .then(
//                function (rosterData) {
//                    if (rosterData) {
//
//                        $scope.course.buildRoster(rosterData);
                        EventService.getEvents($scope.contextMapping.id,$scope.activeDashboard.id,$scope.card.id)
                            .then(handleLRSResponse);
//                    }
//                }
//            );
//        }

	}
	else {
		$log.error('Card not configured for Events');
		$scope.message = 'No supporting event service available';
	}
});

})(angular);
