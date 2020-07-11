sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast"
], function (Controller, Spreadsheet, MessageToast) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.setUpUser", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpUser
		 */
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
			var oMasterData = {
				"MainList": [{
					"Process": "Set Up Process",
					"NavId": "detail"
				}],
				"ProductCollection": [{
					"Process": "Set Up Users",
					"NavId": "detail2"
				}],
				"Projects": [{
					"ProjectName": "Sony",
					"ProjectId": "01"
				}, {
					"ProjectName": "Google",
					"ProjectId": "02"
				}],
				"Pocesses": [{
						"ProcessName": "Ricef Tracker",
						"ProcessId": "01"
					}, {
						"ProcessName": "CR Logging",
						"ProcessId": "02"
					}

				],
				"PocessesTable": [{
					"SectionId": "1",
					"SectionName": "Basic Details",
					"SectionType": "y",
					"FieldName": "Project Id",
					"FieldType": "1",
					"Sequence": "1",
					"SequenceNo": "1",
					"Editable": false
				}, {
					"SectionId": "2",
					"SectionName": "Tr Details",
					"SectionType": "y",
					"FieldName": "Project Type",
					"FieldType": "2",
					"Sequence": "2",
					"SequenceNo": "2",
					"Editable": false
				}],
				"UserScreen": [{
					"Process": "Ricef Tracker",
					"UserId": "1",
					"Role": "Admin",
					"Access": "Edit",
					"ScreenId": "01"
				}, {
					"Process": "CR Logging",
					"UserId": "2",
					"Role": "User",
					"Access": "Display",
					"ScreenId": "02"
				}],
				"UserProcess": [{
					"Process": "Ricef Tracker",
					"UserID": "1",
					"Role": "Admin",
					"Access": "Edit",
					"Editable": true
				}]
			};
			var viewData = new sap.ui.model.json.JSONModel(oMasterData);
			this.getView().setModel(viewData, "viewData");
			this.oDataModelINIT = this.getOwnerComponent().getModel("INIT"); //ZAVI_GW_INIT_STAT_UI_SRV
			this.oDataModel = this.getOwnerComponent().getModel(); //ZAVI_UI_ANNOT_SRV
			this.oViewModel = this.getView().getModel("viewData"); //the view's Model (viewData)
			this.aEditedRows = []; // Array to keep the list of edited rows before POST call
			this.oRouter = this.getOwnerComponent().getRouter(); //getting the router from component
		},
		onDataExport1: function () {
			var aCols, aProducts, oSettings;

			aCols = this.createColumnConfig1();
			this.oViewData.getProperty("/UserProcess");

			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: aProducts
			};

			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					MessageToast.show("Spreadsheet export has finished");
				});
		},
		onChangeFUP: function (e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function (file) {
			if (file && window.FileReader) {
				var reader = new FileReader();
				var that1 = this;
				var result = {};
				reader.onload = function (e) {
					var data = e.target.result;
					var that2 = that1;
					var wb = XLSX.read(data, {
						type: 'binary'
					});
					wb.SheetNames
						.forEach(function (sheetName) {
							var that3 = that2;
							var roa = XLSX.utils
								.sheet_to_row_object_array(wb.Sheets[sheetName]);
							if (roa.length > 0) {
								result[sheetName] = roa;
								// alert(JSON.stringify(result));
								var sheetData = result.Sheet1;
								that3.setSheetData(sheetData, that3);
							}
						});
				};
				reader.readAsBinaryString(file);
			};
		},
		setSheetData: function (sheetData, scope) {
			var HeaderModel = scope.getView().getModel("viewData");
			var HeaderModelData = HeaderModel.getData().PocessesTable;
			for (var i = 0; i < sheetData.length; i++) {
				HeaderModelData.push(sheetData[i]);
			}
			HeaderModel.refresh();
		},
		onUserEdit: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", false);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", true);
		},
		onUserRead: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", true);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", false);
		},
		onNavBack: function () {
			this.oRouter.navTo("RouteMainAdmin");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpUser
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpUser
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpUser
		 */
		//	onExit: function() {
		//
		//	}

	});

});