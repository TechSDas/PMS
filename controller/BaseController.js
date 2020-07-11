sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/BusyIndicator",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportType",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartform/Layout",
	"sap/ui/comp/smartform/ColumnLayout",
	"sap/ui/comp/smartform/GroupElement",
	"sap/ui/comp/smartfield/SmartField",
	"sap/ui/comp/smartform/Group",
	"sap/m/ColumnListItem",
	"sap/ui/core/routing/History"
], function (Controller, BusyIndicator, Device, JSONModel, Export, ExportType, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox,
	UIComponent, SmartForm, Layout, ColumnLayout, GroupElement, SmartField, SmartFormGroup, ColumnListItem, History) {
	"use strict";
	return Controller.extend("zm026_test.controller.BaseController", {
		MessageToast: MessageToast,
		UIComponent: UIComponent,
		BusyIndicator: BusyIndicator,
		MessageBox: MessageBox,
		SmartForm: SmartForm,
		SFGroupElement: GroupElement,
		SmartField: SmartField,
		SFColumnLayout: ColumnLayout,
		SmartFormGroup: SmartFormGroup,
		ColumnListItem: ColumnListItem,
		JSONModel: JSONModel,
		History: History,

		showBusyDialog: function () {
			BusyIndicator.show();
		},
		hideBusyDialog: function () {
			BusyIndicator.hide();
		},

		//Get Text from I18n
		getI18nText: function (textId) {
			return this.getView().getModel("i18n").getResourceBundle().getText(textId);
		}
	});

});