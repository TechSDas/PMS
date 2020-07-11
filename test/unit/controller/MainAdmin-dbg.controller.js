/*global QUnit*/

sap.ui.define([
	"fi/pms/solution/ZFI_PMS_SOL/controller/MainAdmin.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MainAdmin Controller");

	QUnit.test("I should test the MainAdmin controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});