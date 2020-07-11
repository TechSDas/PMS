sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	"sap/ui/core/BusyIndicator"
], function (Controller, MessageBox, BusyIndicator) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.UseView", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.UseView
		 */
		onInit: function () {
			// 	this._getData1();
			// 	this._getData2();
		},
		_getData2: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Username", "EQ", "NIMANIAR"));
			f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
			//var f = [];
			//f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
			//f.push(new sap.ui.model.Filter("Process", "EQ", "1"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 
			BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/UserProcessSet", {
				filters: f, //read call to fetch table data
				success: function (oData) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					that.getView().getModel("viewData").setProperty("/UserScreen", oData.results);
					// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));

				},
				error: function (oError) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
		},

		_getData1: function () {
			var that = this;
			// var f = [];
			// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 
			BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/ProjectDetailsSet", {
				// filters: f, //read call to fetch table data
				success: function (oData) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					that.getView().getModel("viewData").setProperty("/Projects", oData.results); //update the model
					var a = oData.results.length;
					var b = a + 1;
					that.getView().getModel("viewData").setProperty("/Projid", b);
					//	that.getView().getModel("viewData").refresh();
				},
				error: function (oError) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
		},
			onBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Login");

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.UseView
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.UseView
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.UseView
		 */
		//	onExit: function() {
		//
		//	}

	});

});