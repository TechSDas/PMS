sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
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
], function (Controller, History, Device, JSONModel, Export, ExportType, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox,
	UIComponent,
	BusyIndicator) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.setUpProcess", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
		 */
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("Process").attachPatternMatched(this._onObjectMatched, this);

		},
		_onObjectMatched: function (oEvent) {
			this.sProject = oEvent.getParameter("arguments").project;

			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
			// var oMasterData = {
			// 	"MainList": [{
			// 		"Process": "Set Up Process",
			// 		"NavId": "detail"
			// 	}],
			// 	"ProductCollection": [{
			// 		"Process": "Set Up Users",
			// 		"NavId": "detail2"
			// 	}],
			// 	"Projects": [{
			// 		"ProjectName": "Sony",
			// 		"ProjectId": "01"
			// 	}, {
			// 		"ProjectName": "Google",
			// 		"ProjectId": "02"
			// 	}],
			// 	"Pocesses": [{
			// 			"ProcessName": "Ricef Tracker",
			// 			"ProcessId": "01"
			// 		}, {
			// 			"ProcessName": "CR Logging",
			// 			"ProcessId": "02"
			// 		}, {
			// 			"ProcessName": "Defect Tracker",
			// 			"ProcessId": "03"
			// 		}

			// 	],
			// 	"PocessesTable": [{
			// 			"SectionId": "1",
			// 			"SectionName": "Basic Details",
			// 			"SectionType": "y",
			// 			"FieldName": "Project Id",
			// 			"FieldType": "1",
			// 			"Sequence": "1",
			// 			"SequenceNo": "1",
			// 			"Editable": false
			// 		}, {
			// 			"SectionId": "2",
			// 			"SectionName": "Tr Details",
			// 			"SectionType": "y",
			// 			"FieldName": "Project Type",
			// 			"FieldType": "2",
			// 			"Sequence": "2",
			// 			"SequenceNo": "2",
			// 			"Editable": false
			// 		}

			// 	],

			// 	"UserScreen": [{
			// 		"Process": "Ricef Tracker",
			// 		"UserId": "1",
			// 		"Role": "Admin",
			// 		"Access": "Edit",
			// 		"ScreenId": "01"
			// 	}, {
			// 		"Process": "CR Logging",
			// 		"UserId": "2",
			// 		"Role": "User",
			// 		"Access": "Display",
			// 		"ScreenId": "02"
			// 	}],

			// 	"UserProcess": [{
			// 		"Process": "Ricef Tracker",
			// 		"UserID": "1",
			// 		"Role": "Admin",
			// 		"Access": "Edit",
			// 		"Editable": true
			// 	}]

			// };
			// var viewData = new sap.ui.model.json.JSONModel(oMasterData);
			// this.getView().setModel(viewData, "viewData");
			this.oDataModelINIT = this.getOwnerComponent().getModel("INIT"); //ZAVI_GW_INIT_STAT_UI_SRV
			this.oDataModel = this.getOwnerComponent().getModel(); //ZAVI_UI_ANNOT_SRV
			this.oViewModel = this.getView().getModel("viewData"); //the view's Model (viewData)
			this.aEditedRows = []; // Array to keep the list of edited rows before POST call
		},

		onSave: function (oEvt) {
			for (var i in this.aEditedRows) {
				var sPath = this.aEditedRows[i]; //get the path
				var data = this.getView().getModel("viewData").getProperty(sPath); //get data in json form
				BusyIndicator.show(); //Starting Busy Indicator
				this.getOwnerComponent().getModel().create("/ProjectDetailsSet", data, {
					success: function (oData, response) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var msg = "Update Successful";
						MessageBox.success(msg);
						this.aEditedRows = [];
						this._getData1();
					},
					error: function (oError) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg); //Displaying Error Message in Dialog Box
					}
				});
				// var aData = this.oViewModel.getProperty("/PocessesTable/0");
			}
		},
		onChangeFUP: function (e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},

		_import: function (file) {
			if (file && window.FileReader) {
				var reader = new FileReader();
				var that1 = this;
				var result = {};
				var data;
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
		onBack_Process: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteMainAdmin");

		},
		// onAddProcess: function (oEvt) {
		// 	if (!this._AddProcessPop) {
		// 		this._AddProcessPop = sap.ui.xmlfragment("myFragAddProcessPop",
		// 			"fi.pms.solution.ZFI_PMS_SOL.Fragments.AddProcess", this);
		// 		this.getView().addDependent(this._AddProcessPop);
		// 	}
		// 	this._AddProcessPop.openBy(oEvt.getSource());
		// },
		onAddSection: function (oEvt) {
			if (!this._AddSectionPop) {
				this._AddSectionPop = sap.ui.xmlfragment("myFragAddSectionPop",
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AddSection", this);
				this.getView().addDependent(this._AddSectionPop);
			}
			this._AddSectionPop.openBy(oEvt.getSource());
		},
		handleClosePress: function (oEvt) {
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionType");
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequenceVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValue("");
			this._AddSectionPop.close();
		},
		createColumnConfig: function () {

			return [{
				label: 'Section ID',
				property: 'SectionId',
				width: '25'
			}, {
				label: 'Section Name',
				property: 'SectionName',
				width: '25'
			}, {
				label: 'Field Name',
				property: 'FieldName',
				width: '25'
			}, {
				label: 'Field Type',
				property: 'FieldType'
			}, {
				label: 'Sequence',
				property: 'Sequence'
			}];
		},

		handleSavePress: function (oEvt) {
			var SectionName = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").getValue();
			var SectionType = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionTypeVal").getSelectedKey();
			var Sequence = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequenceVal").getValue();
			var SequenceVal = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").getValue();

			var HeaderModel = this.getView().getModel("viewData");
			var HeaderModelData = HeaderModel.getData();
			HeaderModelData.PocessesTable.push({
				SectionName: SectionName,
				SectionType: SectionType,
				Sequence: Sequence,
				SequenceNo: SequenceVal
			});
			HeaderModel.refresh();
			this._AddSectionPop.close();
			sap.ui.core.Fragment.byId("myFragAddSelectionPop", "idSectionNameVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSelectionPop", "idSectionType").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSelectionPop", "idSequenceVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSelectionPop", "idSequencenoVal").setValue("");

			this._AddSectionPop.close();

		},
		onDataExport: function () {
			var aCols, aProducts, oSettings;

			aCols = this.createColumnConfig();
			/*aProducts = this.getView().getModel().getProperty("/ProductCollectionFullSet");*/
			aProducts = this.getView().getModel("viewData").getProperty("/PocessesTable");

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
		onAssignDom: function (oEvnt) {
			if (!this._AssignDomainPop) {
				this._AssignDomainPop = sap.ui.xmlfragment("myFragAssignDomainPop",
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AssignDomain", this);
				this.getView().addDependent(this._AssignDomainPop);
			}
			this._AssignDomainPop.openBy(oEvnt.getSource());
		},
		handleClose: function (oEvt) {
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTableVal").setValue("");

			this._AssignDomainPop.close();
		},
		handleSave: function (oEvt) {
			var FieldName = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").getValue();
			var CheckBox = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckBoxVal").getValue();
			var _Table = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idTableVal").getValue();
			// var a={};
			// var HeaderModel = this.getView().getModel("viewData");
			// var HeaderModelData = HeaderModel.getData();
			// HeaderModelData.PocessesTable.push({
			// 	SectionName: SectionName,
			// 	SectionType: SectionType,
			// 	Sequence: Sequence,
			// 	SequenceNo: SequenceVal
			// });
			// HeaderModel.refresh();
			this._AssignDomainPop.close();
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckBoxType").setValue("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idTableVal").setValue("");

			this._AssignDomainPop.close();
		},
		onContinue: function (oEvent) {

			// var aFilters = [
			// 	new sap.ui.model.Filter("Project", "EQ", this.sProject),
			// 	new sap.ui.model.Filter("Process", "EQ", this.getView().byId("idSelectProcess").getSelectedItem().getText())
			// ];
			
			// this.oDataModel.read("ProcessMasterSet", {
			// 	// filters: aFilters,
			// 	success: function (oData) {
			// 	}.bind(this),
			// 	error: function (oError) {
			// 	}.bind(this)
			// });
			this.onChange();
			this.getView().byId("idselprocess").setExpanded(false);
			this.getView().byId("idsetprocess").setExpanded(true);

		},
		onDeleteRow: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewData");
			var contextPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var index = contextPath.split("/PocessesTable/")[1];
			this.getView().getModel("viewData").getData().PocessesTable.splice(index, 1);
			HeaderModel.refresh();
		},
		onTemplateExport: function () {
			var aCols, aFields, oSettings;

			aCols = this.createColumnConfigTemplate();

			aFields = [];

			var a = {};
			a.SectionId = "";
			a.SectionId = "";
			a.SectionId = "";
			a.FieldName = "";
			a.FieldType = "";
			a.Sequence = "";
			a.SequenceNo = "";
			aFields.push(a);

			oSettings = {
				workbook: {
					columns: aCols
				},
				fileName: "Template for Upload",
				dataSource: aFields
			};

			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					MessageToast.show("Spreadsheet export has finished");
				});
		},
		createColumnConfigTemplate: function () {
			return [{
				label: 'Section ID',
				property: 'SectionId',
				width: '25'
			}, {
				label: 'Section Name',
				property: 'SectionName',
				width: '25'
			}, {
				label: 'Field Name',
				property: 'FieldName',
				width: '25'
			}, {
				label: 'Field Type',
				property: 'FieldType'
			}, {
				label: 'Sequence',
				property: 'Sequence'
			}];
		},
		onAddRow: function () {
			var HeaderModel = this.getView().getModel("viewData");
			var HeaderModelData = HeaderModel.getData().PocessesTable;
			HeaderModelData.splice(0, 0, {
				SectionName: "",
				FieldName: "",
				FieldType: "",
				Sequence: "",
				SequenceNo: "",
				Editable: true
			});
			HeaderModel.refresh();

		},
		onPreview: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.onPreviewSave();
			oRouter.navTo("smartTable");
		},
		onEdit: function (oEvent) {
			this.getView().byId("idProcessTableReadMode").setProperty("visible", false);
			this.getView().byId("idProcessTable").setProperty("visible", true);
			this.getView().byId("idSavePreviewMode").setProperty("visible", true);
		},
		onRead: function (oEvent) {
			this.getView().byId("idProcessTableReadMode").setProperty("visible", true);
			this.getView().byId("idProcessTable").setProperty("visible", false);
			this.getView().byId("idSavePreviewMode").setProperty("visible", false);
		},
		onUserEdit: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", false);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", true);
		},
		onUserRead: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", true);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", false);
		},
		onChangeGetRowIndices: function (oEvent) {
			var sEditedRow = oEvent.getSource().getBindingContext("viewData").sPath;
			if (!this.aEditedRows.includes(sEditedRow)) {
				this.aEditedRows.push(sEditedRow);
			}
		},
		navToAdmin: function (oEvent) {
			this.oRouter.navTo("Admin");
		},
		// onChange: function () {
		// 	//this.getView().byId("idPrcoess").setEnabled(true);
		// 	var that = this;
		// 	var f = [];

		// 	f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
		// 	f.push(new sap.ui.model.Filter("Process", "EQ", "1"));

		// 	BusyIndicator.show(); //Starting Busy Indicator
		// 	this.getOwnerComponent().getModel("INIT").read("/ProcessMasterSet", {
		// 		filters: f, //read call to fetch table data
		// 		success: function (oData) {
		// 			BusyIndicator.hide(); //Hiding Busy Indicator
		// 			that.getView().getModel("viewData").setProperty("/PocessesTable", oData.results); //update the model
		// 		},
		// 		error: function (oError) {
		// 			BusyIndicator.hide(); //Hiding Busy Indicator
		// 			var responseText = JSON.parse(oError.responseText);
		// 			var msg = responseText.error.message.value;
		// 			MessageBox.error(msg); //Displaying Error Message in Dialog Box
		// 		}
		// 	});
		// },
		onPreviewSave: function (oEvt) {
				var oModel = this.getView().getModel("viewData");
				var data = oModel.getProperty("/PocessesTable");

				var body = {
					Projid: data[0].Projid,
					Process: data[0].Process,
					NavHeadToSection: [],
					NavHeadToProcMaster: []

				};

				for (var i = 0; i < data.length; i++) {
					/*	var Projid=data[i].Projid;*/
					//	body.Projid.push(data[i].Projid);
					/*	var Process = data[i].Process;*/
					//	body.Process.push(data[i].Process);
					var a = {};

					a.Projid = data[i].Projid;
					a.Process = data[i].Process;
					a.SectionId = data[i].SectionId;
					a.SectionName = data[i].SectionName;
					a.SectionSeqNum = data[i].SectionSeqNum;
					body.NavHeadToSection.push(a);
					var b = {};
					b.LabelName = data[i].LabelName;
					b.Dataelement = data[i].Dataelement;
					b.SectionName = data[i].SectionName;
					b.Ind = data[i].Ind;
					b.Projid = data[i].Projid;
					b.SectionType = data[i].SectionType;
					b.Process = data[i].Process;
					b.SectionSeqNum = data[i].SectionSeqNum;
					b.SectionId = data[i].SectionId;
					b.Fieldname = data[i].Fieldname;
					b.Sequence = data[i].Sequence;
					b.Type = data[i].Type;
					b.Datatype = data[i].Datatype;
					b.Length = data[i].Length;
					b.Visibility = data[i].Visibility;
					b.Uifilter = data[i].Uifilter;
					body.NavHeadToProcMaster.push(b);

				}

				/*	var oServiceModel = this.getOwnerComponent().getModel("INIT").read("/ProcessMasterSet");
					var sPath = "/HeaderDetailsSet";
					var mParameters = {
						method: "POST",
						success: jQuery.proxy(function (oData) {
							this.getView().setBusy(false);
							BusyIndicator.hide(); //Hiding Busy Indicator
							var msg = "Update Successful";
							MessageBox.success(msg);
						}, this),

						error: jQuery.proxy(function (oError) {
							this.getView().setBusy(false);
							MessageToast.show(oError.responseText);
							//this.getRouter().navTo("home");
						}, this)
					};

					oServiceModel.create(sPath, body, mParameters);*/

				this.getOwnerComponent().getModel("INIT").create("/HeaderDetailsSet", body, {
					success: function (oData, response) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var msg = "Update Successful";
						MessageToast(msg);
						this.onChange();

					}.bind(this),
					error: function (oError) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageToast(msg); //Displaying Error Message in Dialog Box
					}
				});
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
		 */
		//	onExit: function() {
		//
		//	}

	});

});