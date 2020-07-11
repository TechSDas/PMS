sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (e, n) {
	"use strict";
	return {
		createDeviceModel: function () {
			var i = new e(n);
			i.setDefaultBindingMode("OneWay");
			return i
		},

		// BOC - Azhar
		/*		Read a EntitySet and Bind back to the given Model */
		readAndSetModel: function (vController, entitySet, modelName, callbackMethod, filterSet) {
			if (!this.busyIndicator) {
				this.busyIndicator = new sap.m.BusyDialog();
			}
			var modal = this;
			modal.busyIndicator.open();
			var mainModel = this.mainDataModel();

			mainModel.read(entitySet, {
				filters: filterSet,
				success: function (data, response) {
					modal.busyIndicator.close();
					callbackMethod.call(vController, data, modelName, entitySet);
				},
				error: function (oError) {
					modal.busyIndicator.close();
					vController.getView().setModel(oError, modelName);
				}
			});
		},

		//Main Service Link from Odata.
		mainDataModel: function () {
			var sServerUrl = "/sap/opu/odata/sap/ZDPMT_GW_INIT_STAT_UI_SRV/";
			var mainModel = new sap.ui.model.odata.ODataModel(sServerUrl, true);
			return mainModel;
		},
		// EOC - Azhar

		// BOC - Azhar for i18n Method
		getI18nText: function (textId, vController) {
				return vController.getOwnerComponent().getModel("i18n").getResourceBundle().getText(textId);
			}
			// EOC - Azhar for i18n Method
	
	}
});