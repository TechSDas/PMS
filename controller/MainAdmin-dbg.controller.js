sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/Device',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportType',
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	'sap/m/MessageBox',
	"sap/ui/core/UIComponent",
	"sap/ui/core/BusyIndicator"
], function (Controller, Device, JSONModel, Export, ExportType, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox, UIComponent,
	BusyIndicator) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.MainAdmin", {
		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
			this._getData1();
			this._getData2();
			// var oMasterData = {
			// 	"Projects": [{
			// 		"ProjectName": "",
			// 		"ProjectId": "00"
			// 	}, {
			// 		"ProjectName": "Sony",
			// 		"ProjectId": "01"
			// 	}, {
			// 		"ProjectName": "Google",
			// 		"ProjectId": "02"
			// 	}]
			// };
			// var viewData = new sap.ui.model.json.JSONModel(oMasterData);
			// this.getView().setModel(viewData, "viewData");
			this.sProject = "";
		},

		onChange: function (oEvent) {
			this.sProject = oEvent.getParameters().selectedItem.getText();
			var oUserTileContent = this.getView().byId("idUserTile").getTileContent()[0];
			var oProcessTileContent = this.getView().byId("idProcessTile").getTileContent()[0];

			oUserTileContent.setFooter(this.sProject);
			oProcessTileContent.setFooter(this.sProject);
			this.getView().byId("idAdminPageProjectTitle").setText("Project: " + this.sProject);
		},
		onAddProcess: function (oEvt) {
			if (!this._AddProcessPop) {
				this._AddProcessPop = sap.ui.xmlfragment("myFragAddProcessPop",
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AddProcess", this);
				this.getView().addDependent(this._AddProcessPop);
			}
			this._AddProcessPop.openBy(oEvt.getSource());
		},
		navToProcess: function (oEvent) {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Process", {
				project: this.sProject
			});
		},
		navToUser: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("User");
		},
		_getData2: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));
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
			// BusyIndicator.hide(); //Hiding Busy Indicator
		},
		_getUser: function () {
			var that = this;
			//var f = [];
			//f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
			//f.push(new sap.ui.model.Filter("Process", "EQ", "1"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 
			BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/UserDetailsSet('SAKDOGRA')", {
				//	filters: f, //read call to fetch table data
				success: function (oData) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					that.getView().getModel("viewData").setProperty("/PocessesTable", oData.results);
					// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));
					//Rachana Kamath Changes
				},
				error: function (oError) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
			// BusyIndicator.hide(); //Hiding Busy Indicator
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
			// BusyIndicator.hide(); //Hiding Busy Indicator
		},
		handleCloseButton: function (oEvt) {
			sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessNameVal").setValue("");
			//sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessIdVal").setValue("");
			this._AddProcessPop.close();

		},
		handleSaveButton: function (oEvt) {
				var ProjectDesc = sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessNameVal").getValue();
				var ProjectId = sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessIdVal").getValue();

				var HeaderModel = this.getView().getModel("viewData");
				var HeaderModelData = HeaderModel.getData();
				HeaderModelData.Projects.push({
					ProjectDesc: ProjectDesc,
					ProjectId: ProjectId
				});
				HeaderModel.refresh();
				sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessNameVal").setValue("");
				//sap.ui.core.Fragment.byId("myFragAddProcessPop", "idProcessIdVal").setValue("");
				this._AddProcessPop.close();
				for (var i = 0; i < HeaderModelData.Projects.length; i++) {
					var payload = {
						ProjectDesc: HeaderModelData.Projects[i].ProjectDesc,
						ProjectId: HeaderModelData.Projects[i].ProjectId
					};

				}
				this.getOwnerComponent().getModel("INIT").create("/ProjectDetailsSet", payload, {
					success: function (oData, response) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var msg = "Project Successfully Added";
						MessageBox.success(msg);
						this._getData1();
						debugger;
					},
					error: function (oError) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg); //Displaying Error Message in Dialog Box
					}
				});
			}
			/*
							onSideNavButtonPress: function () {
						var toolPage = this.byId("page");
						var sideExpanded = toolPage.getSideExpanded();

						this._setToggleButtonTooltip(sideExpanded);

						toolPage.setSideExpanded(!toolPage.getSideExpanded());
					},
					_setToggleButtonTooltip: function (bLarge) {
						var toggleButton = this.byId('sideNavigationToggleButton');
						if (bLarge) {
							toggleButton.setTooltip('Large Size Navigation');
						} else {
							toggleButton.setTooltip('Small Size Navigation');
						}
					}*/
	});
});