sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.Login", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.Login
		 */
		onInit: function () {

			this.oDataModelINIT = this.getOwnerComponent().getModel("INIT"); //ZAVI_GW_INIT_STAT_UI_SRV
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oDataModelINIT.read("/UserDetailsSet('SAKDOGRA')", {
				success: function (oData) {
					this.getView().byId("userName").setValue(oData.Role);
					this.onLogin();
				}.bind(this),
				error: function (oError) {}.bind(this)
			});

		},
		onLogin: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.navTo("RouteMainAdmin");
			// oRouter.navTo("UseView");
			var user = this.getView().byId("userName").getValue().toUpperCase();
			if (user == "ADMIN") {
				oRouter.navTo("RouteMainAdmin");
			} else if (user == "USER") {
				oRouter.navTo("UseView");
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.Login
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.Login
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.Login
		 */
		//	onExit: function() {
		//
		//	}

	});

});