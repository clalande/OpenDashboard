/**
 * Copyright 2014 Unicon (R)
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use $scope file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var OpenDashboardControllers = angular.module('OpenDashboardControllers', ['ngDialog', 'OpenDashboardServices']);

OpenDashboardControllers.controller('NavbarController', function($scope, $http, $window){
	
	if ($window && $window.inbound_lti_launch_request) {
		$scope.inbound_lti_launch_request = $window.inbound_lti_launch_request;
	}
	
	$scope.isEmbed = function() {
		var isEmbed = false;
		try {
			isEmbed = $window != $window.parent;
		}
		catch (e) {}
		return isEmbed;
	};
	
});

OpenDashboardControllers.controller('WelcomeController', function($scope, $http, $window, $location,
										contextMapping, ContextMappingService){
	// TODO - move to router
	if (contextMapping && contextMapping.id) {
		var url = '/context/' + contextMapping.id;
		$location.path(url);
	}	

	$scope.showWelcome = contextMapping ? false : true;
	
	$scope.saveContextMapping = function() {
		var inbound_lti_launch_request = null;
		if ($window && $window.inbound_lti_launch_request) {
			inbound_lti_launch_request = $window.inbound_lti_launch_request;
		}
		
		var cm = {};
		cm.key = inbound_lti_launch_request.oauth_consumer_key;
		// TODO handle non-context case
		cm.context = inbound_lti_launch_request.context_id;
		ContextMappingService.create(cm)
			.then(function(savedContextMapping) {
				$scope.showWelcome = false;
				var url = '/context/' + savedContextMapping.id;
				$location.path(url);
			});
	};
	
});

OpenDashboardControllers.controller('DashboardController', function($scope, ngDialog, context, installedCards, availableCards, CardInstanceService){
	$scope.context = context;
	$scope.installedCards = [];
	$scope.availableCards = availableCards;
	$scope.dialog = null;
	$scope.card = null;
	$scope.cardConfiguration = {};
	
	$scope.saveCardInstance = function() {
		
		var cardInstance = new CardInstance({});
		cardInstance.setCard($scope.card);
		cardInstance.setConfig($scope.cardConfiguration);
		cardInstance.context = $scope.context;
		cardInstance.sequence = $scope.installedCards ? $scope.installedCards.length : 0;
		
		CardInstanceService.create(cardInstance)
			.then(function(savedCardInstance){
				if (!$scope.installedCards) {
					$scope.installedCards = [];
				}
				$scope.installedCards.push(new CardInstance(savedCardInstance));
				$scope.dialog.close();
			});
	};
	
	
	$scope.addCardInstance = function(card) {
		$scope.card = card;
		$scope.dialog = ngDialog.open(
		{
			template:'/html/cards/'+$scope.card.cardType+'-config.html',
			scope: $scope
		});
	};
	
});

OpenDashboardControllers.controller('LtiCardController', function($scope, $window, $timeout, LtiProxyService) {
	if ($window && $window.inbound_lti_launch_request) {
		$scope.inbound_lti_launch_request = $window.inbound_lti_launch_request;
	}
	
	$scope.readyToLaunch = false;
	$scope.outboundLaunch = null;
	
	LtiProxyService.post($scope.card,$scope.inbound_lti_launch_request)
		.then(function(proxiedLaunch){
			$scope.outboundLaunch = proxiedLaunch;
			$timeout(function() {
				var selector = '#' + $scope.card.id + ' > #lti_launch_form';
				$(selector).attr('action', $scope.outboundLaunch.launchUrl);
				$(selector).submit();
		    }, 2000);
		});

});