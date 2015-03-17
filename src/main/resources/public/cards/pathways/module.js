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
	    ]
    });
 })
 .controller('PathwaysCardController', function($scope, $log, ContextService, RosterService, OutcomesService, DemographicsService) {
	
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

})(angular);
