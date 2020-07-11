sap.ui.define([
	"fi/pms/solution/ZFI_PMS_SOL/controller/BaseController",
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
	"sap/ui/core/BusyIndicator",
	"fi/pms/solution/ZFI_PMS_SOL/model/formatter",
	'sap/ui/core/Fragment',
	'sap/ui/core/Popup',
	"fi/pms/solution/ZFI_PMS_SOL/Utils/dragDropUtil"
], function (BaseController, History, Device, JSONModel, Export, ExportType, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox,
	UIComponent,
	BusyIndicator, formatter, Fragment, Popup, dragDropUtil) {
	"use strict";

	return BaseController.extend("fi.pms.solution.ZFI_PMS_SOL.controller.setUpProcess", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
		 */
		onInit: function () {

			var oRouter = this.getRouter();
			oRouter.attachRouteMatched(this._onObjectMatched, this);
			//Removed by Varun Jain on 21/01/2020
			// this.oRouter = this.getOwnerComponent().getRouter();
			// this.oRouter.getRoute("Process").attachPatternMatched(this._onObjectMatched, this);
			this.byId("openMenu").attachBrowserEvent("tab keyup", function (oEvent) {
				this._bKeyboard = oEvent.type === "keyup";
			}, this);

		},
		_onObjectMatched: function (oEvent) {
			this.sProject = oEvent.getParameter("arguments").project;

			//Added by Varun Jain
			this.oDataModelINIT = this.getOwnerComponent().getModel("INIT"); //ZAVI_GW_INIT_STAT_UI_SRV
			this.oDataModel = this.getOwnerComponent().getModel(); //ZAVI_UI_ANNOT_SRV
			this.oViewModel = this.getView().getModel("viewData"); //the view's Model (viewData)
			this.getView().getModel("viewData").setProperty("/domainData", {});
			this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
			this.getView().getModel("viewData").setProperty("/FieldNames", []);
			this.loadProcesses(); //Added here by Varun

		},
		loadProcesses: function (oEvent) {
			this.oViewModel = this.getView().getModel("viewData");
			this.oDataModelINIT = this.getOwnerComponent().getModel("INIT");
			//Added by Varun Jain
			var that = this; //Varun
			this.getView().byId("idSelectProcess").setSelectedKey(""); //Varun
			this.oViewModel.setProperty("/UserScreen", []); //Varun
			var aFilters = [
				// new sap.ui.model.Filter("Projid", "EQ", "3") // commented : Varun on 03-03-2020
				new sap.ui.model.Filter("Projid", "EQ", this.sProject) // added : Subhajit
			];
			this.oDataModelINIT.read("/UserProcessSet", {
				filters: aFilters,
				success: function (oData) {

					that.oViewModel.setProperty("/UserScreen", oData.results);

				}.bind(this),
				error: function (oError) {
					MessageBox.error("Error in getting Process List");
				}.bind(this)
			});

		},
		onChange: function () {
			//this.getView().byId("idPrcoess").setEnabled(true);
			var that = this;
			var f = [];
			// Begin of Changes : Subhajit
			this.sProcess = this.getView().byId('idSelectProcess').getSelectedKey();
			//f.push(new sap.ui.model.Filter("Projid", "EQ", "3"));
			f.push(new sap.ui.model.Filter("Projid", "EQ", this.sProject));
			//f.push(new sap.ui.model.Filter("Process", "EQ", "1"));
			f.push(new sap.ui.model.Filter("Process", "EQ", this.sProcess));
			BusyIndicator.show();

			this.getOwnerComponent().getModel("INIT").read("/HeaderDetailsSet", {
				filters: f,
				urlParameters: {
					"$expand": "NavF4SearchhelpSet,NavHeadToProcMaster,NavHeadToSection,NavHeadToValidation"
				},
				success: function (oData) {
					BusyIndicator.hide();
					var arr = oData.results[0];
					var arrF4 = oData.results[0].NavF4SearchhelpSet.results;
					var arrP4 = oData.results[0].NavHeadToProcMaster.results;
					that.getView().getModel("viewData").setProperty("/PocessesTable", arr);
					that.getView().getModel("viewData").setProperty("/F4Help", arrF4);
					that.getView().getModel("viewData").setProperty("/ProcessMandt", []);
					that.getView().getModel("viewData").setProperty("/NavHeadToDomainCreate", []);
					that.getView().getModel("viewData").setProperty("/FieldNames", []);
					var oModelData = that.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
					var oMandateData = that.getView().getModel("viewData").getProperty("/ProcessMandt");
					for (var i = 0; i < oModelData.length; i++) {
						if (oModelData[i].Fieldname == 'PROCESS_ID' || oModelData[i].Fieldname == 'PROJECT_ID') {
							var b = {};
							b.LabelName = oModelData[i].LabelName;
							b.Dataelement = oModelData[i].Dataelement;
							b.SectionName = oModelData[i].SectionName;
							b.Ind = oModelData[i].Ind;
							b.SectionType = oModelData[i].SectionType;
							b.SectionSeqNum = oModelData[i].SectionSeqNum;
							b.SectionId = oModelData[i].SectionId;
							b.Fieldname = oModelData[i].Fieldname;
							b.Type = oModelData[i].Type;
							b.Sequence = oModelData[i].Sequence;
							b.Datatype = oModelData[i].Datatype;
							b.Length = oModelData[i].Length;
							b.Visibility = oModelData[i].Visibility;
							b.Uifilter = oModelData[i].Uifilter;
							b.Active = oModelData[i].Active;
							oMandateData.push(b);
							oModelData.splice(i, 1);
							i--;
						}
					}
					window.oModelCopy = JSON.parse(JSON.stringify(oData.results[0]));
					that.getView().getModel("viewData").refresh();
					$.each(oModelData, function (k) {
						if (oModelData[k].Active == 'X') {
							that.byId("idProcessTable").setSelectedItem(that.byId("idProcessTable").getItems()[k], true);
						}
					});
					$.each(oModelData, function (k) {
						if (oModelData[k].LabelName == 'TS DEVELOPER' || oModelData[k].LabelName == 'PLANNED TS START DATE' ||
							oModelData[k].LabelName == 'PLANNED TS COMPLETION DATE' || oModelData[k].LabelName == 'PLANNED TUT START DATE' ||
							oModelData[k].LabelName == 'PLANNED TUT COMPLETION DATE' || oModelData[k].LabelName == 'CODE DEVELOPER' ||
							oModelData[k].LabelName == 'PLANNED CODE COMPLETION DATE' || oModelData[k].LabelName == 'PLANNED FUT START DATE' ||
							oModelData[k].LabelName == 'PLANNED FUT END DATE' || oModelData[k].LabelName == 'FS OWNER') {
							oModelData[k].Visibility = 'M';
						}
					});
					that.getView().getModel("viewData").refresh();
					// $.each(oModelData, function (k) {
					// 	if (oModelData[k].Type == 'DD' || oModelData[k].Type == 'SH') {
					// 		oModelData[k]["editableT"] = true;
					// 	}
					// });
					// that.getView().getModel("viewData").refresh();
					window.lv_counter = 0;
				},
				error: function (err) {
					BusyIndicator.hide();
					var t = JSON.parse(err.responseText);
					var i = t.error.message.value;
					MessageBox.error(i);
				}
			});
			window.array = [];
			// End of Changes : Subhajit
		},
		onSave: function (oEvt) {
			// Begin of Insert by Subhajit / 18.01.2020
			var aItems = this.getView().byId("idProcessTable").getSelectedItems();
			var oModel = this.getView().getModel("viewData");
			var aSection = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results");
			var aDomain = this.getView().getModel("viewData").getProperty("/NavHeadToDomainCreate");
			var oMandateData2 = this.getView().getModel("viewData").getProperty("/ProcessMandt");
			// var aEditedRows = [];
			if (aItems.length == 0 && this.getView().byId("idProcessTable").getItems().length != 0) {
				var i = "Please Select an item";
				MessageBox.warning(i);
				return;
			} else if (this.lv_flag == 1 || window.vs == 'X') {
				var j = "Please check for the errors";
				MessageBox.error(j);
				return;
			}
			// else if (window.lv_counter != undefined && window.lv_counter != aDomain.length) {
			// 	var h = "Please assign Domain Values to new fields";
			// 	MessageBox.warning(h);
			// 	return;
			// } 
			else {
				// this.byId("idProcessTable").getItems()[1].getCells()[10].getVisible();
				var err;
				for (var i = 0; i < aItems.length; i++) {
					if (oModel.getProperty(aItems[i].getBindingContextPath()).LabelName == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionName == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionType == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionSeqNum == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionId == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Fieldname == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Type == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Sequence == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Datatype == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Length == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Visibility == "") {
						err = "X";
						break;
					}
				}
				// if (err == "X") {
				// 	MessageBox.error("All fields are required");
				// 	return;
				// } else {
				// 	var domErr = ""
				// 	if (window.lv_counter != 0 && window.lv_counter != aDomain.length) {
				// 		for (var h = 0; h < window.lv_counter; h++) {
				// 			if (this.byId("idProcessTable").getItems()[h].getSelected() == true) {
				// 				domErr = "X";
				// 				break;
				// 			}
				// 		}
				// 	}
				// if (domErr == "X") {
				// 	MessageBox.warning("Please assign Domain Values to new fields");
				// 	return;
				// } else {
				var t = this.getView().getModel("viewData");
				var NavHeadToProcMaster = [];
				var NavHeadToSec = [];
				var NavHeadToDomainCreate = [];
				if (aSection.length != 0) {
					for (var j = 0; j < aSection.length; j++) {
						var a = {};
						a.Projid = this.sProject;
						a.Process = this.sProcess;
						a.SectionId = aSection[j].SectionId;
						a.SectionName = aSection[j].SectionName;
						a.SectionSeqNum = parseInt(aSection[j].SectionSeqNum);
						NavHeadToSec.push(a);
					}
				}
				// if (aDomain == undefined) {
				// 	// this.getView().getModel("viewData").setProperty("/NavHeadToDomainCreate", []);
				// 		for (var k = 0; k < oNew.length; k++) {
				// 			var c = {};
				// 			c.Projid = this.sProject;
				// 			c.Process = this.sProcess;
				// 			c.Fieldname = oNew[k].Fieldname;
				// 			c.Checktable = ""
				// 			c.Domainname = "";
				// 			c.Datatype = "";
				// 			c.Length = "";
				// 			c.Domainvalue = "";
				// 			c.Domaintext = "";
				// 			c.ValueDesc = "";
				// 			NavHeadToDomainCreate.push(c);
				// 		}
				// 	this.getView().getModel("viewData").setProperty("/NavHeadToDomainCreate", NavHeadToDomainCreate);
				// }
				for (var k = 0; k < oMandateData2.length; k++) {
					var b = {};
					if (aSection.length != 0) {
						var newSec = aSection.filter(aSection => aSection.SectionId == oMandateData2[k].SectionId);
					}
					if (newSec.length != 0) {
						b.SectionName = newSec[0].SectionName;
						b.SectionSeqNum = parseInt(newSec[0].SectionSeqNum);
					} else {
						b.SectionName = oMandateData2[k].SectionName;
						b.SectionSeqNum = parseInt(oMandateData2[k].SectionSeqNum);
					}
					b.LabelName = oMandateData2[k].LabelName;
					b.Dataelement = oMandateData2[k].Dataelement;
					// b.SectionName = oMandateData2[k].SectionName;
					b.Ind = oMandateData2[k].Ind;
					b.Projid = this.sProject;
					b.SectionType = oMandateData2[k].SectionType;
					b.Process = this.sProcess;
					// b.SectionSeqNum = parseInt(oMandateData2[k].SectionSeqNum);
					b.SectionId = oMandateData2[k].SectionId;
					b.Fieldname = oMandateData2[k].Fieldname;
					b.Type = oMandateData2[k].Type;
					b.Sequence = parseInt(oMandateData2[k].Sequence);
					b.Datatype = oMandateData2[k].Datatype;
					b.Length = oMandateData2[k].Length;
					b.Visibility = oMandateData2[k].Visibility;
					b.Uifilter = oMandateData2[k].Uifilter;
					b.Active = 'X';
					NavHeadToProcMaster.push(b);
				}
				if (this.getView().byId("idProcessTable").getItems().length != 0) {
					for (var i = 0; i < aItems.length; i++) {
						var b = {};
						b.LabelName = oModel.getProperty(aItems[i].getBindingContextPath()).LabelName;
						b.Dataelement = oModel.getProperty(aItems[i].getBindingContextPath()).Dataelement;
						b.SectionName = oModel.getProperty(aItems[i].getBindingContextPath()).SectionName;
						b.Ind = oModel.getProperty(aItems[i].getBindingContextPath()).Ind;
						b.Projid = this.sProject;
						b.SectionType = oModel.getProperty(aItems[i].getBindingContextPath()).SectionType;
						b.Process = this.sProcess;
						b.SectionSeqNum = parseInt(oModel.getProperty(aItems[i].getBindingContextPath()).SectionSeqNum);
						b.SectionId = oModel.getProperty(aItems[i].getBindingContextPath()).SectionId;
						b.Fieldname = oModel.getProperty(aItems[i].getBindingContextPath()).Fieldname;
						b.Type = oModel.getProperty(aItems[i].getBindingContextPath()).Type;
						b.Sequence = parseInt(oModel.getProperty(aItems[i].getBindingContextPath()).Sequence);
						b.Datatype = oModel.getProperty(aItems[i].getBindingContextPath()).Datatype;
						b.Length = oModel.getProperty(aItems[i].getBindingContextPath()).Length;
						b.Visibility = oModel.getProperty(aItems[i].getBindingContextPath()).Visibility;
						b.Uifilter = oModel.getProperty(aItems[i].getBindingContextPath()).Uifilter;
						b.Active = 'X';
						NavHeadToProcMaster.push(b);
						if (oModel.getProperty(aItems[i].getBindingContextPath()).newF == "X") {
							var df = aDomain.filter(aDomain => aDomain.Fieldname == b.Fieldname)
							if (df.length == 0) {
								var c = {};
								c.Projid = this.sProject;
								c.Process = this.sProcess;
								c.Fieldname = b.Fieldname;
								c.Checktable = "";
								c.Domainname = "";
								c.Datatype = b.Datatype;
								c.Length = parseInt(b.Length)
								c.Domainvalue = "";
								c.Domaintext = "";
								c.ValueDesc = "";
								NavHeadToDomainCreate.push(c);
							} else {
								for (var l = 0; l < df.length; l++) {
									var c = {};
									c.Projid = this.sProject;
									c.Process = this.sProcess;
									c.Fieldname = df[l].Fieldname;
									if (df[l].Checktable == undefined) {
										c.Checktable = "";
									} else {
										c.Checktable = df[l].Checktable;
									}
									c.Domainname = df[l].Domainname;
									c.Datatype = df[l].Datatype;
									c.Length = df[l].Length;
									c.Domainvalue = df[l].Domainvalue;
									c.Domaintext = df[l].Domaintext;
									c.ValueDesc = df[l].ValueDesc;
									NavHeadToDomainCreate.push(c);
								}
							}
						}
					}
				}
				var oData = {
					Projid: this.sProject,
					Process: this.sProcess,
					Indicator: "S",
					NavHeadToSection: NavHeadToSec,
					NavHeadToProcMaster: NavHeadToProcMaster,
					// NavHeadToDomainCreate: this.getView().getModel("viewData").getProperty("/NavHeadToDomainCreate")
					NavHeadToDomainCreate: NavHeadToDomainCreate
				};
				BusyIndicator.show();

				this.getOwnerComponent().getModel("INIT").create("/HeaderDetailsSet", oData, {
						success: function (e, t) {
							BusyIndicator.hide();
							var i = "Fields are updated successfully";
							MessageBox.success(i);
							this.getView().byId("idProcessTable").removeSelections();
							this.onChange();
						}.bind(this),
						error: function (e) {
							BusyIndicator.hide();
							// var t = JSON.parse(e.responseText);
							// var i = t.error.message.value;
							var i = jQuery.parseXML(e.responseText).querySelector("message").textContent;
							MessageBox.error(i);
						}
					})
					// domErr = "";
					// }
				err = "";
				// }
			}
			// }
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
			//Added by Varun Jain for emptying the table data & setting the panel expand.
			this.getView().byId("idProcessTable").removeSelections();
			this.getView().getModel("viewData").setProperty("/PocessesTable", []);
			this.getView().byId("idselprocess").setExpanded(true);
			this.getView().byId("idsetprocess").setExpanded(false);
			this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
			this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
			this.getView().byId("idProcessTable").removeAllItems();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TargetMainAdmin");

		},
		onAddSection: function (oEvt) {
			if (!this._AddSectionPop) {
				this._AddSectionPop = sap.ui.xmlfragment("myFragAddSectionPop",
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AddSection", this);
				this.getView().addDependent(this._AddSectionPop);
			}
			// this._AddSectionPop.openBy(oEvt.getSource());
			this._AddSectionPop.open(this);
		},
		handleCloseSection: function (oEvt) {
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValue("");
			/*							sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionType");
										sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequenceVal").setValue("");*/ //commented by Subhajit/16.01.2020
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValue("");
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.None);
			sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.None);
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
				property: 'Type'
			}, {
				label: 'Sequence',
				property: 'Sequence'
			}];
		},

		handleSaveSection: function (oEvt) {
			this.t = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").getValue();
			this.i = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionTypeVal").getSelectedItem().getText();
			this.a = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").getValue();
			if (this.t == "" || this.a == "") {
				var i = "Missing value";
				MessageBox.warning(i);
				if (this.t == "" && this.a == "") {
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.Error);
				} else if (this.t == "") {
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.Error);
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.None);
				} else if (this.a == "") {
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.None);
					sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.Error);
				}

			} else {
				var viewModel = this.getView().getModel("viewData");
				var sectData = viewModel.getProperty("/PocessesTable/NavHeadToSection/results");
				// for (var i = 0; i < sectData.length; i++) {
				// 	if (sectData[i].SectionName == this.t) {
				// 		var sNameFlag = 1;
				// 		break;
				// 	}
				// }
				// for (var i = 0; i < sectData.length; i++) {
				// 	if (sectData[i].SectionSeqNum == this.a) {
				// 		var sSeqFlag = 1;
				// 		break;
				// 	}
				// }

				// if (sNameFlag == 1 && sSeqFlag == 1) {
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.Error);
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueStateText("Section Name already exists");
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.Error);
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueStateText("Sequence number already exists");
				// 	return;
				// } 
				// else if (sNameFlag == 1) {
				// if (sNameFlag == 1) {
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.Error);
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueStateText("Section Name already exists");
				// 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.None);
				// 	return;
				// }
				// // } else if (sSeqFlag == 1) {
				// // 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.Error);
				// // 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.None);
				// // 	sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueStateText("Sequence number already exists");
				// // 	return;
				// // 	} else {
				// else {
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.None);
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValueState(sap.ui.core.ValueState.None);
				var oModel = this.getView().getModel("viewData");
				var oData = oModel.getProperty("/PocessesTable/NavHeadToSection/results");
				var oData1 = oModel.getProperty("/NavHeadToSection");
				oData.splice(0, 0, {
					Projid: this.sProject,
					Process: this.sProcess,
					SectionId: this.a,
					SectionName: this.t,
					SectionType: this.i,
					SectionSeqNum: parseInt(this.a)
				});
				if (oData1 === undefined) {
					oModel.setProperty("/NavHeadToSection", [{
						Projid: this.sProject,
						Process: this.sProcess,
						SectionId: this.a,
						SectionName: this.t,
						SectionSeqNum: parseInt(this.a)
					}]);
				} else {
					oData1.push({
						Projid: this.sProject,
						Process: this.sProcess,
						SectionId: this.a,
						SectionName: this.t,
						SectionSeqNum: parseInt(this.a)
					});
				}

				oModel.refresh();
				var i = "Section has been saved";
				MessageBox.success(i);
				this._AddSectionPop.close();
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValue("");
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValue("");
				// this.getView().byId("idProcessTable").removeSelections();
				// }
			}
			this.getView().getModel("viewData").refresh();
		},
		onDataExport: function () {
			var aCols, aProducts, oSettings;
			// e = this.createColumnConfig(); commented by Subhajit/18.01.2020
			var e = this.createColumnConfigTemplate(); //added by Subhajit / 18.01 .2020
			/*aProducts = this.getView().getModel().getProperty("/ProductCollectionFullSet");*/
			aProducts = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results"); //added by Subhajit / 18.01 .2020

			oSettings = {
				workbook: {
					columns: e
				},
				dataSource: aProducts
			};

			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					MessageBox.success("Data exported successfully");
				});
		},
		onAssignDom: function (oEvnt) {
			if (!this._AssignDomainPop) {
				this._AssignDomainPop = sap.ui.xmlfragment("myFragAssignDomainPop",
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AssignDomain", this);
				this.getView().addDependent(this._AssignDomainPop);
			}
			// this._AssignDomainPop.openBy(oEvnt.getSource());
			this._AssignDomainPop.open(this);
		},
		handleClose: function (oEvt) {
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setSelectedKey("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTbl").setValue("");
			// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomain").setValue("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDataType").setValue("");
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idLength").setValue("");
			// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").unbindItems();
			this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").removeAllItems();
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndValues").setSelected(true);
			window.domErr = "";
			sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndDomValues").setSelected(false);
			this.getView().getModel("viewData").refresh();
			this.getView().getModel("viewData").setProperty("/domainData", {});
			this._AssignDomainPop.close();
			this._AssignDomainPop.destroy();
			this._AssignDomainPop = null;
		},
		onSaveDomain: function (oEvt) {
			var oModel = this.getView().getModel("viewData");
			var aDomainValues = this.getView().getModel("viewData").getProperty("/domainData/domainVlaues");
			var oDomain = this.getView().getModel("viewData").getProperty("/domainData");
			this.r1 = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndValues").getSelected();
			this.r2 = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndDomValues").getSelected();
			var fieldVal = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").getSelectedKey();
			var aNavHeadToDomainCreate = oModel.getProperty("/NavHeadToDomainCreate");
			var oFieldModel = oModel.getProperty("/FieldNames");
			var domainEditFlag = this.getView().getModel("viewData").getProperty("/domainEditFlag");
			if (fieldVal == "" || fieldVal == undefined) {
				MessageBox.warning("Please add a new field OR Select the field here");
			} else {
				if (window.domErr == "X") {
					MessageBox.error("Please check the errors");
				} else {
					window.domErr = "";
					if (this.r1 == true) {
						if ((sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTbl").getValue()) == "") {
							MessageBox.warning("Please Enter Check table Name");
							return;
						} else {
							aNavHeadToDomainCreate.splice(0, 0, {
								Projid: this.sProject,
								Process: this.sProcess,
								Fieldname: fieldVal,
								Checktable: oDomain.Checktable,
								Domainname: "",
								Datatype: oDomain.Datatype,
								Length: parseInt(oDomain.Length),
								Domainvalue: "",
								Domaintext: "",
								ValueDesc: ""
							})
							this.getView().getModel("viewData").setProperty("/NavHeadToDomainCreate", aNavHeadToDomainCreate);
							MessageBox.success("Domain Values have been saved");
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setSelectedKey("");
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTbl").setValue("");
							// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomain").setValue("");
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDataType").setValue("");
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idLength").setValue("");
							// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").unbindItems();
							this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").removeAllItems();
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndValues").setSelected(true);
							sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndDomValues").setSelected(false);
							window.domErr = "";;
							this.getView().getModel("viewData").setProperty("/domainData", {});
							// for (var i = 0; i < oFieldModel.length; i++) {
							// 	if (oFieldModel[i].FieldName == fieldVal) {
							// 		oFieldModel.splice(i, 1);
							// 		break;
							// 	}
							// }
							this.getView().getModel("viewData").refresh();
							this._AssignDomainPop.close();
							this._AssignDomainPop.destroy();
							this._AssignDomainPop = null;
						}

					} else {
						if (oDomain.Domainname == "" || oDomain.Length == "" || oDomain.Datatype == "") {
							MessageBox.warning("Please enter required values");
						} else {
							if (aDomainValues == undefined || aDomainValues.length == 0) {
								MessageBox.error("Please enter Domain Values");
							} else {
								var errArr = aDomainValues.filter(aDomainValues => aDomainValues.Domainvalue == "" || aDomainValues.Domaintext == "")
								if (errArr.length != 0 || errArr == undefined) {
									MessageBox.warning("Please fill all the values");
								} else {
									for (var i = 0; i < aDomainValues.length; i++) {
										aNavHeadToDomainCreate.splice(0, 0, {
											Projid: this.sProject,
											Process: this.sProcess,
											Fieldname: sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").getSelectedKey(),
											Checktable: "",
											Domainname: "",
											Datatype: oDomain.Datatype,
											Length: parseInt(oDomain.Length),
											Domainvalue: aDomainValues[i].Domainvalue,
											Domaintext: aDomainValues[i].Domaintext,
											ValueDesc: ""
										})
									}
									this.getView().getModel("viewData").setProperty("/NavHeadToDomainCreate", aNavHeadToDomainCreate);
									MessageBox.success("Domain Values have been saved");
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setSelectedKey("");
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTbl").setValue("");
									// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomain").setValue("");
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDataType").setValue("");
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idLength").setValue("");
									// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").unbindItems();
									this.getView().getModel("viewData").setProperty("/domainEditFlag", true);
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").removeAllItems();
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndValues").setSelected(true);
									sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndDomValues").setSelected(false);
									window.domErr = "";
									this.getView().getModel("viewData").setProperty("/domainData", {});
									// for (var i = 0; i < oFieldModel.length; i++) {
									// 	if (oFieldModel[i].FieldName == fieldVal) {
									// 		oFieldModel.splice(i, 1);
									// 		break;
									// 	}
									// }
									this.getView().getModel("viewData").refresh();
									this._AssignDomainPop.close();
									this._AssignDomainPop.destroy();
									this._AssignDomainPop = null;
								}
							}
						}
					}
				}
			}
		},
		onContinue: function (oEvent) {
			this.getView().byId("idProcessTable").removeSelections();
			this.onChange();
			this.getView().byId("idselprocess").setExpanded(false);
			this.getView().byId("idsetprocess").setExpanded(true);
			this.onRead();
			this.getView().getModel("viewData").setProperty("/processTitle", this.getView().getModel("viewData").getProperty(oEvent.getSource()
				.getSelectedItem().getBindingContext("viewData").getPath()).ProcessDesc);
			// End of Changes : Subhajit
		},
		onDeleteRow: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewData");
			// var contextPath = oEvent.getSource().getParent().getParent().getBindingContextPath(); //commented by Subhajit/16.01.2020
			var contextPath = oEvent.getSource().getParent().getBindingContextPath(); //added by Subhajit/16.01.2020
			var oField = HeaderModel.getProperty("/FieldNames");
			var oDomainC = HeaderModel.getProperty("/NavHeadToDomainCreate");
			var oFieldModel = HeaderModel.getProperty("/FieldNames");
			var items = this.getView().byId("idProcessTable").getSelectedItems();
			var index = contextPath.split("/PocessesTable/NavHeadToProcMaster/results")[1];
			var delF = HeaderModel.getProperty(contextPath).Fieldname;
			var idx = index.replace('/', '');
			this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results").splice(idx, 1);
			window.lv_counter = window.lv_counter - 1;

			if (window.vs == 'X') {
				oEvent.getSource().getParent().getCells()[4].setValueState("None");
				oEvent.getSource().getParent().getCells()[5].setValueState("None");
				oEvent.getSource().getParent().getCells()[6].setValueState("None");
				oEvent.getSource().getParent().getCells()[7].setValueState("None");
				window.vs = "";
			}
			// for (var i = 0; i < oFieldModel.length; i++) {
			// 	if (oFieldModel[i].FieldName == delF) {
			// 		oFieldModel.splice(i, 1);
			// 		break;
			// 	}
			// }
			if (oFieldModel != undefined || oFieldModel.length != 0) {
				// $.each(oFieldModel, function (i) {
				// 	if (oFieldModel[i].FieldName == delF) {
				// 		oFieldModel.splice(i, 1);
				// 	}
				// });
				for (var i = 0; i < oFieldModel.length; i++) {
					if (oFieldModel[i].FieldName == delF) {
						oFieldModel.splice(i, 1);
					}
				}
			}
			if (oDomainC != undefined || oDomainC.length != 0) {
				// $.each(oDomainC, function (k) {
				// 	if (oDomainC[k].Fieldname == delF) {
				// 		oDomainC.splice(i, 1);
				// 	}
				// });
				for (var k = 0; k < oDomainC.length; k++) {
					if (oDomainC[k].Fieldname == delF) {
						oDomainC.splice(k, 1);
					}
				}
			}
			if (oField.length != 0) {
				for (var i = 0; i < oField.length; i++) {
					oField[i].pIndex = parseInt(oField[i].pIndex - 1);
				}
			}
			this.getView().byId("idProcessTable").removeSelections();
			for (var j = 0; j < items.length; j++) {
				var cp = items[j].getBindingContextPath().split("/PocessesTable/NavHeadToProcMaster/results")[1];
				var lngth = items[j].getBindingContextPath().split("/PocessesTable/NavHeadToProcMaster/results")[1].length;
				var idx = (parseInt(cp.substring(1, lngth)) - 1);
				this.byId("idProcessTable").setSelectedItem(this.byId("idProcessTable").getItems()[idx], true);
			}
			HeaderModel.refresh();
		},
		onTemplateExport: function () {
			var aCols, aFields, oSettings;

			aCols = this.createColumnConfigTemplate();

			aFields = [];

			var a = {};
			//Begin of Changes by Subhajit/18.01.2020
			/*											a.SectionId = "";
														a.SectionId = "";
														a.SectionId = "";
														a.FieldName = "";
														a.FieldType = "";
														a.Sequence = "";
														a.SequenceNo = "";*/
			a.SectionName = "";
			a.SectionType = "";
			a.SectionSeqNum = "";
			a.LabelName = "";
			a.FieldName = "";
			a.Type = "";
			a.Datatype = "";
			a.Length = "";
			a.Sequence = "";
			a.Visibility = "";
			//End of Changes by Subhajit/18.01.2020
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
					MessageBox.success("Spreadsheet export has been completed");
				});
		},
		createColumnConfigTemplate: function () {
			return [
				//Begin of Changes by Subhajit/18.01.2020
				/*				{
									label: "Section ID",
									property: "SectionId",
									width: "25"
								},*/
				{
					label: "Section Name",
					property: "SectionName",
					width: "25"
				}, {
					label: "Section Type",
					property: "SectionType",
					width: "25"
				}, {
					label: "Section Sequence Number",
					property: "SectionSeqNum",
					width: "25"
				}, {
					label: "Label Name",
					property: "LabelName",
					width: "25"
				}, {
					label: "Field Name",
					property: "FieldName",
					width: "25"
				}, {
					label: "Field Type",
					property: "Type",
				}, {
					label: "Data Type",
					property: "Datatype",
					width: "25"
				}, {
					label: "Length",
					property: "Length",
					width: "25"
				}, {
					label: "Sequence",
					property: "Sequence",
					width: "25"
				}, {
					label: "Visibility",
					property: "Visibility",
					width: "25"
				}
			];
		},
		onAddRow: function (oEvent) {
			if (window.vs == 'X') {
				MessageBox.error("Please remove the error");
			} else {
				var HeaderModel = this.getView().getModel("viewData");
				var oField = HeaderModel.getProperty("/FieldNames");
				var items = this.getView().byId("idProcessTable").getSelectedItems();
				var oData = this.getView().getModel("viewData").getProperty(this.getView().byId("idProcessTable").getBindingInfo("items").path);

				if (oData[0].LabelName == "" ||
					oData[0].SectionName == "" ||
					oData[0].SectionType == "" ||
					oData[0].SectionSeqNum == "" ||
					oData[0].SectionId == "" ||
					oData[0].Fieldname == "" ||
					oData[0].Type == "" ||
					oData[0].Sequence == "" ||
					oData[0].Datatype == "" ||
					oData[0].Length == "" ||
					oData[0].Visibility == "") {
					MessageBox.warning("All fields are required");
				} else {
					oData.splice(0, 0, {
						LabelName: "",
						Dataelement: "",
						SectionName: "",
						Ind: "",
						Projid: this.sProject,
						SectionType: "",
						Process: this.sProcess,
						SectionSeqNum: "",
						SectionId: "",
						Fieldname: "",
						Type: "",
						Sequence: "",
						Datatype: "",
						Length: "",
						Visibility: "",
						Uifilter: "",
						editable: true,
						editable2: false,
						newF: "X"
					});
					if (window.lv_counter == undefined) {
						window.lv_counter = 0;
						window.lv_counter = window.lv_counter + 1;
					} else {
						window.lv_counter = window.lv_counter + 1;
					}
					if (oField.length != 0) {
						for (var i = 0; i < oField.length; i++) {
							oField[i].pIndex = parseInt(oField[i].pIndex + 1);
						}
					}
					this.getView().getModel("viewData").setProperty(this.getView().byId("idProcessTable").getBindingInfo("items").path, oData);
					this.getView().byId("idProcessTable").removeSelections();
					for (var j = 0; j < items.length; j++) {
						var cp = items[j].getBindingContextPath().split("/PocessesTable/NavHeadToProcMaster/results")[1];
						var lngth = items[j].getBindingContextPath().split("/PocessesTable/NavHeadToProcMaster/results")[1].length;
						var idx = parseInt(cp.substring(1, lngth)) + 1;
						this.byId("idProcessTable").setSelectedItem(this.byId("idProcessTable").getItems()[
							idx], true);
					}
					window.fIndex = "";
					HeaderModel.refresh();
				}
			}
		},
		onPreview: function () {
			// change by Amol Vaity
			this.onPreviewSave();
		},
		onEdit: function (oEvent) {
			this.getView().byId("idProcessTableReadMode").setProperty("visible", false);
			this.getView().byId("idProcessTable").setProperty("visible", true);
			// this.getView().byId("idProcessTable").setSelectedIndex(1);
			this.getView().byId("idSaveButton").setProperty("enabled", true);
			this.getView().byId("idPreviewButton").setProperty("enabled", true);
			// this.getView().byId("idProcessTable").removeSelections()
		},
		onRead: function (oEvent) {
			this.getView().byId("idProcessTableReadMode").setProperty("visible", true);
			this.getView().byId("idProcessTable").setProperty("visible", false);
			this.getView().byId("idSaveButton").setProperty("enabled", false);
			this.getView().byId("idPreviewButton").setProperty("enabled", false);

		},
		onUserEdit: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", false);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", true);

		},
		onUserRead: function (oEvent) {
			this.getView().byId("idProductsTableReadMode").setProperty("visible", true);
			this.getView().byId("idProductsTableEditMode").setProperty("visible", false);
		},
		/*commented by Subhajit/18.01.2020*/
		// onChangeGetRowIndices: function (oEvent) {
		// 	this.getView().setBusy(true);
		// 	var oSelectedItems = oEvent.getSource().getSelectedItems();
		// 	this.aEditedRows = [];
		// 	for (var i = 0; i < oSelectedItems.length; i++) {
		// 		var sEditedRow2 = this.getView().getModel("viewData").getProperty(oSelectedItems[i].getBindingContextPath());
		// 		// if (!this.aEditedRows.includes(sEditedRow)) {
		// 		delete sEditedRow2.editable
		// 		this.aEditedRows.push(JSON.parse(JSON.stringify(sEditedRow2)));
		// 		// }
		// 	}
		// 	this.getView().setBusy(false);

		// },
		onChangeGetRowIndices2: function (oEvent) {
			this.getView().setBusy(true);
			var oSelectedItems = oEvent.getSource().getSelectedItems();
			this.aEditedRows2 = [];
			for (var i = 0; i < oSelectedItems.length; i++) {
				var sEditedRow3 = this.getView().getModel("viewData").getProperty(oSelectedItems[i].getBindingContextPath());
				// if (!this.aEditedRows.includes(sEditedRow)) {
				delete sEditedRow3.editable
				this.aEditedRows2.push(JSON.parse(JSON.stringify(sEditedRow3)));
				// }
			}
			this.getView().setBusy(false);

		},
		navToAdmin: function (oEvent) {
			this.oRouter.navTo("Admin");
		},

		/*commented by Subhajit/18.01.2020*/
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
			//changed by Amol Vaity
			//changed by Subhajit Das
			var oModel = this.getView().getModel("viewData");
			var data = oModel.getProperty("/PocessesTable/NavHeadToSection/results");
			var aItems = this.getView().byId("idProcessTable").getSelectedItems();
			if (aItems.length == 0) {
				var i = "Please Select an item to preview";
				MessageBox.error(i);
				return;
			} else if (this.lv_flag == 1 || window.vs == 'X') {
				var j = "Please check for the errors";
				MessageBox.error(j);
				return;
			} else {
				var err;
				for (var i = 0; i < aItems.length; i++) {
					if (oModel.getProperty(aItems[i].getBindingContextPath()).LabelName == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionName == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionType == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionSeqNum == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).SectionId == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Fieldname == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Type == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Sequence == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Datatype == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Length == "" ||
						oModel.getProperty(aItems[i].getBindingContextPath()).Visibility == "") {
						err = "X";
						break;
					}
				}
				if (err == "X") {
					MessageBox.error("All fields are required");
					return;
				} else {
					var body = {
						// Projid: data[0].Projid,
						Projid: this.sProject,
						// Process: data[0].Process,
						Process: this.sProcess,
						Indicator: "P",
						NavHeadToSection: [],
						NavHeadToProcMaster: []

					};
					/*commented by Subhajit/18.01.2020*/
					// for (var i = 0; i < this.aEditedRows.length; i++) {
					//           var a = {};
					//           a.Projid = this.aEditedRows[i].Projid;
					//           a.Process = this.aEditedRows[i].Process;
					//           a.SectionId = this.aEditedRows[i].SectionId;
					//           a.SectionName = this.aEditedRows[i].SectionName;
					//           a.SectionSeqNum = this.aEditedRows[i].SectionSeqNum;
					//           body.NavHeadToSection.push(a);
					//           var b = {};
					//           b.LabelName = this.aEditedRows[i].LabelName;
					//           b.Dataelement = this.aEditedRows[i].Dataelement;
					//           b.SectionName = this.aEditedRows[i].SectionName;
					//           b.Ind = this.aEditedRows[i].Ind;
					//           b.Projid = this.sProject;
					//           b.SectionType = this.aEditedRows[i].SectionType;
					//           b.Process = this.sProcess;
					//           b.SectionSeqNum = this.aEditedRows[i].SectionSeqNum;
					//           b.SectionId = this.aEditedRows[i].SectionId;
					//           b.Fieldname = this.aEditedRows[i].Fieldname;
					//           b.Type = this.aEditedRows[i].Type;
					//           b.Sequence = this.aEditedRows[i].Sequence;
					//           b.Datatype = this.aEditedRows[i].Datatype;
					//           b.Length = this.aEditedRows[i].Length;
					//           b.Visibility = this.aEditedRows[i].Visibility;
					//           b.Uifilter = this.aEditedRows[i].Uifilter;
					//           b.keyFlag = this.aEditedRows[i].keyFlag;
					//           body.NavHeadToProcMaster.push(b);
					// }
					var aSection = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results");
					if (aSection.length != 0) {
						for (var j = 0; j < aSection.length; j++) {
							var a = {};
							// a.Projid = "3";
							a.Projid = this.sProject;
							// a.Process = "1";
							a.Process = this.sProcess;
							a.SectionId = aSection[j].SectionId;
							a.SectionName = aSection[j].SectionName;
							a.SectionSeqNum = parseInt(aSection[j].SectionSeqNum);
							body.NavHeadToSection.push(a);
						}
					}
					/*added by Subhajit/18.01.2020*/
					var aItems2 = this.getView().byId("idProcessTable").getSelectedItems();
					for (var i = 0; i < aItems2.length; i++) {
						var b = {};
						b.LabelName = oModel.getProperty(aItems2[i].getBindingContextPath()).LabelName;
						b.Dataelement = oModel.getProperty(aItems2[i].getBindingContextPath()).Dataelement;
						b.SectionName = oModel.getProperty(aItems2[i].getBindingContextPath()).SectionName;
						b.Ind = oModel.getProperty(aItems2[i].getBindingContextPath()).Ind;
						b.Projid = this.sProject;
						b.SectionType = oModel.getProperty(aItems2[i].getBindingContextPath()).SectionType;
						b.Process = this.sProcess;
						b.SectionSeqNum = parseInt(oModel.getProperty(aItems2[i].getBindingContextPath()).SectionSeqNum);
						b.SectionId = oModel.getProperty(aItems2[i].getBindingContextPath()).SectionId;
						b.Fieldname = oModel.getProperty(aItems2[i].getBindingContextPath()).Fieldname;
						b.Type = oModel.getProperty(aItems2[i].getBindingContextPath()).Type;
						b.Sequence = parseInt(oModel.getProperty(aItems2[i].getBindingContextPath()).Sequence);
						b.Datatype = oModel.getProperty(aItems2[i].getBindingContextPath()).Datatype;
						b.Length = oModel.getProperty(aItems2[i].getBindingContextPath()).Length;
						b.Visibility = oModel.getProperty(aItems2[i].getBindingContextPath()).Visibility;
						b.Uifilter = oModel.getProperty(aItems2[i].getBindingContextPath()).Uifilter;
						b.Active = 'X';
						body.NavHeadToProcMaster.push(b);
					}
					/*added by Subhajit/18.01.2020*/
					var oMandateData2 = this.getView().getModel("viewData").getProperty("/ProcessMandt");
					for (var k = 0; k < oMandateData2.length; k++) {
						var c = {};
						c.LabelName = oMandateData2[k].LabelName;
						c.Dataelement = oMandateData2[k].Dataelement;
						c.SectionName = oMandateData2[k].SectionName;
						c.Ind = oMandateData2[k].Ind;
						c.Projid = this.sProject;
						c.SectionType = oMandateData2[k].SectionType;
						c.Process = this.sProcess;
						c.SectionSeqNum = parseInt(oMandateData2[k].SectionSeqNum);
						c.SectionId = oMandateData2[k].SectionId;
						c.Fieldname = oMandateData2[k].Fieldname;
						c.Type = oMandateData2[k].Type;
						c.Sequence = parseInt(oMandateData2[k].Sequence);
						c.Datatype = oMandateData2[k].Datatype;
						c.Length = oMandateData2[k].Length;
						c.Visibility = oMandateData2[k].Visibility;
						c.Uifilter = oMandateData2[k].Uifilter;
						c.Active = 'X';
						body.NavHeadToProcMaster.push(c);
					}
					this.getView().setBusy(true);
					this.getOwnerComponent().getModel("INIT").create("/HeaderDetailsSet", body, {
						success: function (oData, response) {
							// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
							// // BusyIndicator.hide(); //Hiding Busy Indicator
							// // var msg = "Update Successful";
							// this.getView().getModel("dynamicFormModel").setData(oData);
							// this.getView().setBusy(false);
							// this.showBusyDialog();
							// oRouter.navTo("smartTable");
							// MessageToast(msg);
							this.callCrossApp()
						}.bind(this),
						error: function (oError) {
							this.getView().setBusy(false);
							BusyIndicator.hide(); //Hiding Busy Indicator
							var responseText = JSON.parse(oError.responseText);
							var msg = responseText.error.message.value;
							MessageToast.show(msg); //Displaying Error Message in Dialog Box
						}.bind(this)
					});
					err = "";
				}
			}
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this); //initalise router
		},
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.setUpProcess
		 */
		onBeforeRendering: function () {
			//this.loadProcesses();
		},
		//added : Subhajit
		onAddPress: function (oEvent) {
			// var oItem = new sap.m.ColumnListItem({
			// 	cells: [
			// 		new sap.m.Input({
			// 			type: "Text",
			// 		}),
			// 		new sap.m.Input({
			// 			type: "Text",
			// 		}),
			// 	]
			// });
			// var oTable = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable")
			// oTable.addItem(oItem);
			if (window.domErr == "X") {
				MessageBox.error("Please check the errors");
			} else {
				var fName = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").getSelectedKey();
				// var dName = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomain").getValue();
				var dType = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDataType").getSelectedKey();
				var dLength = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idLength").getValue();
				if ((fName == "" || fName == undefined) || (dType == "" || dType == undefined) || dLength == "") {
					MessageBox.error("Please enter required fields");
				} else {
					var HeaderModel = this.getView().getModel("viewData");
					var oDataD = this.getView().getModel("viewData").getProperty("/domainData/domainVlaues");
					// var oData = this.getView().getModel("viewData").getProperty(sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").getBindingInfo(
					// 	"items").path);
					if (oDataD === undefined) {
						// oData = [{
						// 	Domainvalue: "",
						// 	Domaintext: ""

						// }];
						oDataD = [];
						oDataD.splice(0, 0, {
							Domainvalue: "",
							Domaintext: ""
						});
					} else {
						if (oDataD[0].Domainvalue == "" || oDataD[0].Domaintext == "") {
							MessageBox.error("Values are mandatory");
						} else {
							oDataD.splice(0, 0, {
								Domainvalue: "",
								Domaintext: ""
							});
						}
					}
					this.getView().getModel("viewData").setProperty(sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").getBindingInfo(
						"items").path, oDataD);
					// this.getView().getModel("viewData").setProperty("/domainData/domainVlaues", oDataD);
					HeaderModel.refresh();
				}
			}
		},
		onRadioButtonSelect: function (oEvent) {
			// var rdBtnId = oEvent.getSource().getId();
			var rdBtnGrp = oEvent.getSource().getGroupName();
			var rdBtnGrp = oEvent.getSource().getGroupName();
			var model = this.getView().getModel("viewData");
			// if (rdBtnId.search("rdBtnIndValues") === -1) {
			if (rdBtnGrp === "GroupA") {
				model.setProperty("/domainEditFlag", true);
				// this.getView().byId("idDomain").setValue("");
				// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomain").setValue("");
				// this.getView().byId("idDataType").setValue("");
				// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDataType").setValue("");
				// this.getView().byId("idLength").setValue("");
				// sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idLength").setValue("");
				sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndDomValues").setSelected(false);
				// this.getView().byId("idDomainTable").removeAllItems();
				sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").removeAllItems();
			} else {
				model.setProperty("/domainEditFlag", false);
				// this.getView().byId("idCheckTbl").setValue("");
				sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idCheckTbl").setValue("");
				sap.ui.core.Fragment.byId("myFragAssignDomainPop", "rdBtnIndValues").setSelected(false);
			}
			model.refresh();
		},
		onPressOpenMenu: function (oEvent) {
			var oButton = this.getView().byId("openMenu");
			if (!this._menu) {
				Fragment.load({
					name: "fi.pms.solution.ZFI_PMS_SOL.Fragments.Menu",
					controller: this
				}).then(function (oMenu) {
					this._menu = oMenu;
					this.getView().addDependent(this._menu);
					this._menu.open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
				}.bind(this));
			} else {
				this._menu.open(this._bKeyboard, oButton, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oButton);
			}
		},

		onDropSelectedProductsTable: function (oEvent) {
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDraggedItemContext = oDraggedItem.getBindingContext("viewData1");
			if (!oDraggedItemContext) {
				return;
			}

			var oRanking = dragDropUtil.ranking;
			var iNewRank = oRanking.Default;
			var oDroppedItem = oEvent.getParameter("droppedControl");

			if (oDroppedItem instanceof sap.m.ColumnListItem) {
				// get the dropped row data
				var sDropPosition = oEvent.getParameter("dropPosition");
				var oDroppedItemContext = oDroppedItem.getBindingContext("viewData1");
				var iDroppedItemRank = oDroppedItemContext.getProperty("SectionId");
				var oDroppedTable = oDroppedItem.getParent();
				var iDroppedItemIndex = oDroppedTable.indexOfItem(oDroppedItem);

				// find the new index of the dragged row depending on the drop position
				var iNewItemIndex = iDroppedItemIndex + (sDropPosition === "After" ? 1 : -1);
				var oNewItem = oDroppedTable.getItems()[iNewItemIndex];
				if (!oNewItem) {
					// dropped before the first row or after the last row
					iNewRank = oRanking[sDropPosition](iDroppedItemRank);
				} else {
					// dropped between first and the last row
					var oNewItemContext = oNewItem.getBindingContext("viewData1");
					iNewRank = oRanking.Between(iDroppedItemRank, oNewItemContext.getProperty("SectionId"));
				}
			}

			// set the rank property and update the model to refresh the bindings
			var oSelectedProductsTable = dragDropUtil.getSelectedProductsTable(this);
			var oProductsModel = oSelectedProductsTable.getModel("viewData");
			oProductsModel.setProperty("SectionId", iNewRank, oDraggedItemContext);
		},
		onConfirmSectionSetting: function () {
			var chngdSec, lv_recnt;
			var track1 = [];
			var processTableData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var sectionData = this.getView().byId("table").getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results")
			for (var i = 0; i < processTableData.length; i++) {
				var array = sectionData.filter(d => d.SectionId == parseInt(processTableData[i].SectionId));
				if (array.length !== 0) {
					if (processTableData[i].SectionName != array[0].SectionName || processTableData[i].SectionSeqNum != array[0].SectionSeqNum) {
						if (track1.length == 0) {
							track1.push({
								SectionId: array[0].SectionId
							});
							lv_recnt = array[0].SectionId;
						} else {
							if (lv_recnt != array[0].SectionId) {
								track1.push({
									SectionId: array[0].SectionId
								});
								lv_recnt = array[0].SectionId;
							}
						}
					}
					processTableData[i].SectionName = array[0].SectionName;
					processTableData[i].SectionSeqNum = array[0].SectionSeqNum;
				}
			}
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", processTableData);

			for (var h = 0; h < processTableData.length; h++) {
				for (var l = 0; l < track1.length; l++) {
					if (processTableData[h].SectionId == track1[l].SectionId) {
						this.byId("idProcessTable").setSelectedItem(this.byId("idProcessTable").getItems()[h], true);
						break;
					}
				}
			}
			this._sectionSetting.close(this);
			this.getView().byId("table").removeSelections();
			window.oTempCopy1 = [];
			window.oTempCopy1S = [];
			MessageBox.success("Section Alignment Success");
		},
		onEditSectionSetting: function () {
			{
				if (!this._sectionSetting) {
					this._sectionSetting = sap.ui.xmlfragment(this.getView().getId(),
						"fi.pms.solution.ZFI_PMS_SOL.Fragments.sectionSetting", this);
					this.getView().addDependent(this._sectionSetting);
				}
				var oData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results");
				var procData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
				window.oTempCopy1 = JSON.parse(JSON.stringify(procData));
				window.oTempCopy1S = JSON.parse(JSON.stringify(oData));
				for (var i = 0; i < oData.length; i++) {
					oData[i].SectionSeqNum = parseInt(oData[i].SectionSeqNum);
				}
				this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToSection/results", oData);
				this.getView().byId("table").setModel(this.getView().getModel("viewData"), "viewData1");
				// this._sectionSetting.setModel(this.getView().getModel("viewData"),"viewData1")
				this._sectionSetting.open(this);
			}
		},
		onEditFieldsSetting: function () {
			{
				if (!this._fieldsSetting) {
					this._fieldsSetting = sap.ui.xmlfragment(this.getView().getId(),
						"fi.pms.solution.ZFI_PMS_SOL.Fragments.fieldsSetting", this);
					this.getView().addDependent(this._fieldsSetting);
				}
				// this.getView().getModel("viewData").refresh();
				var procData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
				window.oTempCopy2 = JSON.parse(JSON.stringify(procData));
				var oData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results");
				window.oTempCopy2S = JSON.parse(JSON.stringify(oData));
				for (var i = 0; i < oData.length; i++) {
					oData[i].SectionSeqNum = parseInt(oData[i].SectionSeqNum);
				}
				this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToSection/results", oData);
				// this.getView().byId("table0").setModel(this.getView().getModel("viewData"), "viewData1");
				// this.getView().byId("table1").setModel(this.getView().getModel("viewData"), "viewData1");
				this._fieldsSetting.setModel(this.getView().getModel("viewData"), "viewData1")
				this._fieldsSetting.open(this);
			}
		},
		moveUp: function () {
			this.moveSelectedItem("Up");
		},

		moveDown: function () {
			this.moveSelectedItem("Down");
		},

		onBeforeOpenContextMenu: function (oEvent) {
			oEvent.getParameters().listItem.setSelected(true);
		},

		onBeforeOpenContextMenu1: function (oEvent) {
			oEvent.getParameters().listItem.setSelected(true);
		},
		moveSelectedItem: function (sDirection) {
			var oSelectedProductsTable = this.getView().byId("table")
			dragDropUtil.getSelectedItemContext1(oSelectedProductsTable, function (oSelectedItemContext, iSelectedItemIndex) {
				var iSiblingItemIndex = iSelectedItemIndex + (sDirection === "Up" ? -1 : 1);
				var oSiblingItem = oSelectedProductsTable.getItems()[iSiblingItemIndex];
				var oSiblingItemContext = oSiblingItem.getBindingContext("viewData1");
				if (!oSiblingItemContext) {
					return;
				}

				// swap the selected and the siblings rank
				var oProductsModel = oSelectedProductsTable.getModel("viewData1");
				var iSiblingItemRank = oSiblingItemContext.getProperty("SectionSeqNum");
				var iSelectedItemRank = oSelectedItemContext.getProperty("SectionSeqNum");

				oProductsModel.setProperty("SectionSeqNum", iSiblingItemRank, oSelectedItemContext);
				oProductsModel.setProperty("SectionSeqNum", iSelectedItemRank, oSiblingItemContext);
				var a = [new sap.ui.model.Sorter("SectionSeqNum", false)]
				oSelectedProductsTable.getBinding("items").sort(a)
					// after move select the sibling
				oSelectedProductsTable.getItems()[iSiblingItemIndex].setSelected(true);
			});
		},

		onSelectionChange: function (oEvent) {
			this.getView().getModel("viewData").setProperty("/processTableData", JSON.parse(JSON.stringify(this.getView().getModel(
					"viewData")
				.getProperty(
					"/PocessesTable/NavHeadToProcMaster/results"))));
			this.sSelectedKey = oEvent.getSource().getSelectedKey();
			var a = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, oEvent.getSource().getSelectedKey())];
			this.getView().byId("table0").getBinding("items").filter(a);
			// this.getView().byId("table0").setVisible(true);
			// this.getVIew().byId().setModel(this.getView().getModel("viewData"), "viewData1");
		},
		onSelectionChange1: function (oEvent) {
			if (this.sSelectedKey === oEvent.getSource().getSelectedKey()) {
				oEvent.getSource().setSelectedKey("");
				oEvent.getSource().setValue("");
				var i = "Please select another section";
				// MessageToast.show(i);
				MessageBox.error(i);
				return;
			}
			this.getView().getModel("viewData").setProperty("/processTableData", this.getView().getModel("viewData").getProperty(
				"/PocessesTable/NavHeadToProcMaster/results"));
			var a = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, oEvent.getSource().getSelectedKey())];
			this.sectionId1 = oEvent.getSource().getSelectedKey();
			this.getView().byId("table2").getBinding("items").filter(a);
			// this.getView().byId("table").setVisible(true);
			// this.getVIew().byId().setModel(this.getView().getModel("viewData"), "viewData1");

		},
		onCloseSectionSetting: function () {
			// var processTableData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
			// var sectionData = this.getView().byId("table").getModel("viewData1").getProperty("/PocessesTable/NavHeadToSection/results")
			// for (var i = 0; i < processTableData.length; i++) {
			// 	var array = sectionData.filter(d => d.SectionId == parseInt(processTableData[i].SectionId));
			// 	if (array.length !== 0) {
			// 		processTableData[i].SectionName = array[0].SectionName
			// 		processTableData[i].SectionSeqNum = array[0].SectionSeqNum
			// 		var changesSec = processTableData[i].SectionId;
			// 	}
			// }
			// this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", processTableData);
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", window.oTempCopy1);
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToSection/results", window.oTempCopy1S)
			window.oTempCopy1 = [];
			window.oTempCopy1S = [];
			// this._sectionSetting.close(this);
			this._sectionSetting.destroy(this);
			this._sectionSetting = undefined;
		},

		// onCloseSectionSetting: function () {
		// 	this.onChange();
		// 	// oData.results[0] = JSON.parse(JSON.stringify(oModelCopy));
		// 	this._sectionSetting.close(this);
		// },

		// moveToAvailableProductsTable: function () {
		// 	this.moveToAvailableProductsTable();
		// },

		// moveToSelectedProductsTable: function () {
		// 	this.moveToSelectedProductsTable();
		// },

		moveToSelectedTable: function () {
			if (this.sSelectedKey == this.sectionId1 || this.sectionId1 == undefined) {
				MessageBox.error("Source and Target Section cannot be similar");
			} else {
				var oAvailableProductsTable = this.getView().byId("table0");
				var index;
				dragDropUtil.getSelectedItemContext(oAvailableProductsTable,
					function (oAvailableItemContext, iAvailableItemIndex) {
						var oSelectedProductsTable = this.getView().byId("table2");
						var oLastItemOfSelectedProductsTable = oSelectedProductsTable.getItems()[oSelectedProductsTable.getItems().length - 1];
						//Subhajit
						var oSiblingItem = oAvailableProductsTable.getItems()[iAvailableItemIndex];
						var oSiblingItemContext = oSiblingItem.getBindingContext("viewData");
						//Subhajit
						if (oLastItemOfSelectedProductsTable) {
							var oFirstContextOfSelectedProductsTable = oLastItemOfSelectedProductsTable.getBindingContext("viewData");
							var iNewRank = oFirstContextOfSelectedProductsTable.getProperty("Sequence") + 1
						} else {
							iNewRank = 1
						}
						var oProductsModel = oAvailableProductsTable.getModel("viewData");
						var seq = oAvailableItemContext.getProperty("Sequence") - 1;
						for (var i = iAvailableItemIndex; i < oAvailableProductsTable.getItems().length - 1; i++) {
							var itemContext = oAvailableProductsTable.getItems()[i + 1].getBindingContext("viewData");
							seq = seq + 1
							oProductsModel.setProperty("Sequence", seq, itemContext);
						}
						var sectionData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results")
						var array = sectionData.filter(d => d.SectionId == this.sectionId1);

						oProductsModel.setProperty("Sequence", iNewRank, oAvailableItemContext);
						oProductsModel.setProperty("SectionId", this.sectionId1, oAvailableItemContext);
						oProductsModel.setProperty("SectionSeqNum", array[0].SectionSeqNum, oAvailableItemContext);
						oProductsModel.setProperty("SectionName", array[0].SectionName, oAvailableItemContext);

						// select the inserted and previously selected item

						var afilter = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.sSelectedKey)];
						this.getView().byId("table0").getBinding("items").filter(afilter);
						var afilter1 = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.sectionId1)];
						this.getView().byId("table2").getBinding("items").filter(afilter1);
						//Subhajit
						index = oSiblingItemContext.sPath.substring(18, 20);
						window.array.push({
							Index: index
						})
						oSelectedProductsTable.getItems()[0].setSelected(true);
						var oPrevSelectedItem = oAvailableProductsTable.getItems()[iAvailableItemIndex];
						if (oPrevSelectedItem) {
							oPrevSelectedItem.setSelected(true);
						}
					}.bind(this));
			}
		},
		moveToAvailableTable: function () {
			if (this.sSelectedKey == this.sectionId1 || this.sectionId1 == undefined) {
				MessageBox.error("Source and Target Section cannot be similar");
			} else {
				var index;
				var oAvailableProductsTable = this.getView().byId("table2");
				dragDropUtil.getSelectedItemContext(oAvailableProductsTable, function (oAvailableItemContext, iAvailableItemIndex) {
					var oSelectedProductsTable = this.getView().byId("table0");
					var oLastItemOfSelectedProductsTable = oSelectedProductsTable.getItems()[oSelectedProductsTable.getItems().length - 1];
					//Subhajit
					var oSiblingItem = oAvailableProductsTable.getItems()[iAvailableItemIndex];
					var oSiblingItemContext = oSiblingItem.getBindingContext("viewData");
					//Subhajit
					if (oLastItemOfSelectedProductsTable) {
						var oFirstContextOfSelectedProductsTable = oLastItemOfSelectedProductsTable.getBindingContext("viewData");
						var iNewRank = oFirstContextOfSelectedProductsTable.getProperty("Sequence") + 1
					} else {
						iNewRank = 1
					}
					var oProductsModel = oAvailableProductsTable.getModel("viewData");
					var seq = oAvailableItemContext.getProperty("Sequence") - 1;
					for (var i = iAvailableItemIndex; i < oAvailableProductsTable.getItems().length - 1; i++) {
						var itemContext = oAvailableProductsTable.getItems()[i + 1].getBindingContext("viewData");
						seq = seq + 1
						oProductsModel.setProperty("Sequence", seq, itemContext);
					}
					var sectionData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results")
					var array = sectionData.filter(d => d.SectionId == this.sSelectedKey);
					// var oProductsModel = oAvailableProductsTable.getModel("viewData");
					oProductsModel.setProperty("Sequence", iNewRank, oAvailableItemContext);
					oProductsModel.setProperty("SectionId", this.sSelectedKey, oAvailableItemContext);
					oProductsModel.setProperty("SectionSeqNum", array[0].SectionSeqNum, oAvailableItemContext);
					oProductsModel.setProperty("SectionName", array[0].SectionName, oAvailableItemContext);

					// select the inserted and previously selected item
					// oSelectedProductsTable.getItems()[0].setSelected(true);
					var afilter = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.sSelectedKey)];
					this.getView().byId("table0").getBinding("items").filter(afilter);
					var afilter1 = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.sectionId1)];
					this.getView().byId("table2").getBinding("items").filter(afilter1);
					//Subhajit
					index = oSiblingItemContext.sPath.substring(18, 20);
					window.array.push({
						Index: index
					})
					var oPrevSelectedItem = oAvailableProductsTable.getItems()[iAvailableItemIndex];
					if (oPrevSelectedItem) {
						oPrevSelectedItem.setSelected(true);
					}
				}.bind(this));
			}
		},

		moveUp1: function () {
			this.moveSelectedItem1("Up");
		},

		moveDown1: function () {
			this.moveSelectedItem1("Down");
		},
		moveUp2: function () {
			this.moveSelectedItem2("Up");
		},

		moveDown2: function () {
			this.moveSelectedItem2("Down");
		},
		moveSelectedItem1: function (sDirection) {
			var index;
			var oSelectedProductsTable = this.getView().byId("table0");
			dragDropUtil.getSelectedItemContext(oSelectedProductsTable, function (oSelectedItemContext, iSelectedItemIndex) {
				var iSiblingItemIndex = iSelectedItemIndex + (sDirection === "Up" ? -1 : 1);
				var oSiblingItem = oSelectedProductsTable.getItems()[iSiblingItemIndex];
				var oSiblingItemContext = oSiblingItem.getBindingContext("viewData");
				if (!oSiblingItemContext) {
					return;
				}

				// swap the selected and the siblings rank
				var oProductsModel = oSelectedProductsTable.getModel("viewData");
				var iSiblingItemRank = oSiblingItemContext.getProperty("Sequence");
				var iSelectedItemRank = oSelectedItemContext.getProperty("Sequence");

				oProductsModel.setProperty("Sequence", iSiblingItemRank, oSelectedItemContext);
				oProductsModel.setProperty("Sequence", iSelectedItemRank, oSiblingItemContext);
				var a = [new sap.ui.model.Sorter("Sequence", false)]
				oSelectedProductsTable.getBinding("items").sort(a)
					// after move select the sibling
				oSelectedProductsTable.getItems()[iSiblingItemIndex].setSelected(true);

				//Subhajit
				index = oSiblingItemContext.sPath.substring(18, 20);
				window.array.push({
					Index: index - 1
				})
			});
		},
		moveSelectedItem2: function (sDirection) {
			var index;
			var oSelectedProductsTable = this.getView().byId("table2");
			dragDropUtil.getSelectedItemContext(oSelectedProductsTable, function (oSelectedItemContext, iSelectedItemIndex) {
				var iSiblingItemIndex = iSelectedItemIndex + (sDirection === "Up" ? -1 : 1);
				var oSiblingItem = oSelectedProductsTable.getItems()[iSiblingItemIndex];
				var oSiblingItemContext = oSiblingItem.getBindingContext("viewData");
				if (!oSiblingItemContext) {
					return;
				}
				// swap the selected and the siblings rank
				var oProductsModel = oSelectedProductsTable.getModel("viewData");
				var iSiblingItemRank = oSiblingItemContext.getProperty("Sequence");
				var iSelectedItemRank = oSelectedItemContext.getProperty("Sequence");

				oProductsModel.setProperty("Sequence", iSiblingItemRank, oSelectedItemContext);
				oProductsModel.setProperty("Sequence", iSelectedItemRank, oSiblingItemContext);
				var a = [new sap.ui.model.Sorter("Sequence", false)]
				oSelectedProductsTable.getBinding("items").sort(a)
					// after move select the sibling
				oSelectedProductsTable.getItems()[iSiblingItemIndex].setSelected(true);

				//Subhajit
				index = oSiblingItemContext.sPath.substring(18, 20);
				window.array.push({
					Index: index - 1
				})
			});
		},

		onConfirmFieldsSetting: function () {
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", JSON.parse(JSON.stringify(this.getView()
				.getModel("viewData").getProperty(
					"/processTableData"))));
			this._fieldsSetting.close(this);
			for (var i = 0; i < window.array.length; i++) {
				this.byId("idProcessTable").setSelectedItem(this.byId("idProcessTable").getItems()[window.array[i].Index], true);
			}
			this.getView().getModel("viewData").setProperty("/processTableData", {});
			this.getView().getModel("viewData").refresh();
			// MessageToast.show("Success");
			MessageBox.success("Field Alignment Success");
			this.getView().byId("cb12").setSelectedKey(null);
			this.getView().byId("cb22").setSelectedKey(null);
			window.oTempCopy2 = [];
			window.oTempCopy2S = [];
			this._fieldsSetting.destroy(
				this);
			this._fieldsSetting = undefined;
		},

		onCloseFieldsSetting: function () {
			this.getView().getModel("viewData").setProperty("/processTableData", JSON.parse(JSON.stringify(this.getView()
				.getModel("viewData").getProperty(
					"/PocessesTable/NavHeadToProcMaster/results"))));
			this.getView().getModel("viewData").setProperty("/processTableData", {});
			// this.onChange();
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", window.oTempCopy2);
			window.oTempCopy2 = [];
			window.oTempCopy2S = [];
			this.getView().byId("cb12").setSelectedKey(null);
			this.getView().byId("cb22").setSelectedKey(null);
			this._fieldsSetting.destroy(
				this);
			this._fieldsSetting = undefined

		},

		onReset: function () {
			this.onChange();
			this.getView().getModel("viewData").refresh();
			this.getView().getModel("viewData").setProperty("/domainData", {});
			var procsData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToProcMaster/results");
			// oData.results[0] = JSON.parse(JSON.stringify(oModelCopy));
			this.byId("idProcessTable").removeSelections();
			var Items = this.byId("idProcessTable").getItems();
			// if (Items.length != 0) {
			// 	for (var i = 0; i < Items.length; i++) {
			// 		Items[i].getCells()[5].setValueState(sap.ui.core.ValueState.None);
			// 		Items[i].getCells()[6].setValueState(sap.ui.core.ValueState.None);
			// 		Items[i].getCells()[7].setValueState(sap.ui.core.ValueState.None);

			// 	}
			// }
			$.each(Items, function (k) {
				Items[k].getCells()[5].setValueState(sap.ui.core.ValueState.None);
				Items[k].getCells()[6].setValueState(sap.ui.core.ValueState.None);
				Items[k].getCells()[7].setValueState(sap.ui.core.ValueState.None);
			});
			// $.each(procsData, function (k) {
			// 	if (procsData[k].fValState == "Error" || procsData[k].dValState == "Error" || procsData[k].lValState == "Error") {
			// 		procsData[k].fValState = "None";
			// 		procsData[k].dValState = "None";
			// 		procsData[k].lValState = "None";
			// 	}
			// });
			// valData.forEach(function (i, k) {
			// 	if (valData[k].lState == "Error") {
			// 		valData[k].lState = "None";
			// 	}
			// });
			window.vs = "";
		},
		onDeleteSection: function () {
			if (!this._deleteSection) {
				this._deleteSection = sap.ui.xmlfragment(this.getView().getId(),
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.DeleteSection", this);
				this.getView().addDependent(this._sectionSetting);
			}
			this.getView().byId("cb3").setModel(this.getView().getModel("viewData"), "viewData1");
			this._deleteSection.open(this);
		},

		handleDeletePress: function () {
			var cValue = this.getView().byId("cb3").getSelectedKey();
			var cValueText = this.getView().byId("cb3").getValue();
			if (cValue == null || cValue == undefined || cValue == "") {
				var i = "Please Select a Section to delete";
				MessageBox.warning(i);
			} else {
				var pFlag, sFlag;
				var modelData = this.getView().getModel("viewData");
				var processData = modelData.getProperty("/PocessesTable/NavHeadToProcMaster/results");
				var sectionData = modelData.getProperty("/PocessesTable/NavHeadToSection/results");
				if (sectionData.length == 1) {
					MessageBox.warning("Final Section cannot be deleted,please Re-Align fields to a new Section");
				} else {
					if (processData) {
						for (var i = 0; i < processData.length; i++) {
							if (processData[i].SectionId == cValue) {
								processData.splice(i, 1);
								i--;
								pFlag = 1;
							}
						}
					} else {
						pFlag = 1;
					}
					if (sectionData) {
						for (var i = 0; i < sectionData.length; i++) {
							if (sectionData[i].SectionId === cValue) {
								sectionData.splice(i, 1);
								i--;
								sFlag = 1;
							}
						}
					}
					if (pFlag == 1 && sFlag == 1 || (pFlag == 1 || sFlag == 1)) {
						MessageBox.information(`${cValueText} Deleted Succesfully`);
					} else {
						MessageBox.error("Something went wrong");
					}
					modelData.refresh();
					this.getView().byId("cb3").setSelectedKey(null);
					this._deleteSection.destroy(this);
					this._deleteSection = undefined;
				}
			}
		},

		handleCancelPress1: function () {
			this.getView().byId("cb3").setSelectedKey(null);
			this._deleteSection.destroy(this);
			this._deleteSection = undefined
		},

		onReDelete: function () {
			if (!this._redelete) {
				this._redelete = sap.ui.xmlfragment(this.getView().getId(),
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.AlignDelete", this);
				this.getView().addDependent(this._redelete);
			}
			this._redelete.open(this);
			var viewModel = this.getView().getModel("viewData");
			var procData = viewModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var sData = viewModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			window.oTempCopy = JSON.parse(JSON.stringify(procData));
			window.oTempCopyS = JSON.parse(JSON.stringify(sData));
		},

		onCancelAlignDelete: function () {

		},

		onDeleteDomainRow: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewData");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			oEvent.getSource().getParent().getCells()[0].setValueState("None");
			window.domErr = "";
			var index = contextPath.split(sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").getBindingInfo("items").path)[
				1];
			this.getView().getModel("viewData").getProperty(sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idDomainTable").getBindingInfo(
				"items").path).splice(index,
				1);
			HeaderModel.refresh();
		},

		onFieldNameChange: function (oEvent) {
			var viewModel = this.getView().getModel("viewData");
			var oField = viewModel.getProperty("/FieldNames");
			var iField = oEvent.getParameter("value");
			var procData = viewModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var oDomainC = viewModel.getProperty("/NavHeadToDomainCreate");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath(); //added by Subhajit/16.01.2020
			var index = contextPath.split("/PocessesTable/NavHeadToProcMaster/results")[1];
			var idx = index.replace('/', '');
			this.lv_flag = "";
			for (var i = 0; i < procData.length; i++) {
				if (i != idx) {
					if (procData[i].Fieldname == iField) {
						this.lv_flag = 1;
						break;
					}
				}
			}
			if (this.lv_flag == 1) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				oEvent.getSource().setValueStateText("FieldName already exists");
				window.vs = 'X';
			} else {
				var array = oField.filter(d => d.pIndex == idx);
				if (array.length != 0 || array == undefined) {
					var oldF = array[0].FieldName;
					array[0].FieldName = iField;
					this.lv_flag = "";
					if (oDomainC.length != 0) {
						$.each(oDomainC, function (k) {
							if (oDomainC[k].Fieldname == oldF) {
								oDomainC.splice(k, 1);
							}
						});
					}
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
					window.vs = "";
					viewModel.refresh();
				} else {
					oField.splice(0, 0, {
						FieldName: iField,
						pIndex: idx
					});
					this.lv_flag = "";
					oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
					window.vs = "";
					viewModel.refresh();
				}
			}
		},
		onSecNameChange: function (oEvent) {
			var viewModel = this.getView().getModel("viewData");
			var oSecName = oEvent.getParameters().selectedItem.mProperties.text;
			var oSecId = oEvent.getSource().getSelectedKey();
			var procsData = viewModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var len = procsData.length;
			var sectData = viewModel.getProperty("/PocessesTable/NavHeadToSection/results");
			// for (var i = 0; i < sectData.length; i++) {
			// 	if (sectData[i].SectionName == oSecName) {
			// 		var secNum = sectData[i].SectionSeqNum;
			// 		break;
			// 	}
			// }
			var oPath = oEvent.getSource().getParent().oBindingContexts.viewData.getPath();
			var index = oPath.split("/PocessesTable/NavHeadToProcMaster/results")[1];
			var idx = index.replace('/', '');
			var secValue = sectData.filter(sectData => sectData.SectionName == oSecName);
			var procsValue = procsData.filter(procsData => procsData.SectionName == oSecName);
			if (procsValue.length != 0) {
				if (viewModel.getProperty(`${oPath}/editable`) != undefined) {
					var lastFSeq = procsValue.reduce(
						function (prev, current) {
							return (prev.Sequence > current.Sequence) ? prev : current
						});
					viewModel.setProperty("/PocessesTable/NavHeadToProcMaster/results/" + idx + "/Sequence", lastFSeq.Sequence + 1);
				} else {
					var curData = viewModel.getProperty(oPath);
					var cpy = window.oModelCopy.NavHeadToProcMaster.results;
					var orgnlData = cpy.filter(cpy => cpy.Fieldname == curData.Fieldname && cpy.SectionId == oSecId);
					if (orgnlData.length != 0) {
						viewModel.setProperty("/PocessesTable/NavHeadToProcMaster/results/" + idx + "/Sequence", orgnlData[0].Sequence);
					} else {
						var lastFSeq = procsValue.reduce(
							function (prev, current) {
								return (prev.Sequence > current.Sequence) ? prev : current
							});
						viewModel.setProperty("/PocessesTable/NavHeadToProcMaster/results/" + idx + "/Sequence", lastFSeq.Sequence + 1);
					}

				}
			} else {
				var lastFSeq = 1;
				viewModel.setProperty("/PocessesTable/NavHeadToProcMaster/results/" + idx + "/Sequence", lastFSeq);
			}
			// var oPath = oEvent.getSource().getParent().getBindingContext().getPath();
			viewModel.setProperty("/PocessesTable/NavHeadToProcMaster/results/" + idx + "/SectionSeqNum", secValue[0].SectionSeqNum);
			viewModel.setProperty(
				"/PocessesTable/NavHeadToProcMaster/results/" + idx + "/SectionName", oSecName);
			viewModel.refresh();

		},
		onCloseAlignD: function () {
			this.getView().getModel("viewData").setProperty("/processTableData", {});
			this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", window.oTempCopy);
			window.oTempCopy = [];
			window.oTempCopyS = [];
			// this.getView().getModel("viewData").refresh();
			this.getView().byId("cbs1").setSelectedKey(null);
			this.getView().byId("cbs2").setSelectedKey(null);
			this._redelete.destroy(this);
			this._redelete = undefined
		},

		moveToTargetSection: function () {
			if (this.getView().byId("cbs2").getSelectedKey() == null || this.getView().byId("cbs1").getSelectedKey() == null || this.getView()
				.byId(
					"cbs2").getSelectedKey() == undefined || this.getView().byId("cbs1").getSelectedKey() == undefined || this.getView().byId(
					"cbs2")
				.getSelectedKey() ==
				"" || this.getView().byId("cbs1").getSelectedKey() == "") {
				MessageBox.error("Please Select Source and Target Section");
			} else {
				this.track = [];
				this.lv_start_flag = this.lv_start_flag + 1; //Start,Activity Seq Flag
				if (isNaN(this.lv_start_flag) == true) {
					this.lv_start_flag = 1;
				}
				this.aEditedRows2;
				var items = this.getView().byId("tableS").getSelectedItems();
				var viewModel = this.getView().getModel("viewData");
				var procsData = viewModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
				// procsData.splice(0, 1);
				if (items.length == 0) {
					MessageBox.warning("Please Select a row");
				} else {
					// Retreive last field sequence of T Table
					// for (var k = 0; k < procsData.length; k++) {
					// 	if (procsData[k].SectionId == this.getView().byId("cbs2").getSelectedKey()) {
					// 		if (this.lv_start_flag == 1) {
					// 			this.lv_last_seq = (procsData[k].Sequence + 1)
					// 		} else {
					// 			if (this.lv_seq_tmp == procsData[k].Sequence) {
					// 				this.lv_last_seq = (procsData[k].Sequence + 1);
					// 			}
					// 		}
					// 	}
					// }
					var sectData = procsData.filter(procsData => procsData.SectionId == this.getView().byId("cbs2").getSelectedKey());
					var lastSeqD = sectData.reduce(function (prev, current) {
						return (prev.Sequence > current.Sequence) ? prev : current
					});
					var seq = lastSeqD.Sequence + 1;
					for (var i = 0; i < this.aEditedRows2.length; i++) {
						//Modify Array
						if (this.aEditedRows2[i].Fieldname != null || this.aEditedRows2[i].Fieldname != undefined || this.aEditedRows2[i].Fieldname !=
							"") {

							for (var j = 0; j < procsData.length; j++) {
								if (procsData[j].Fieldname == this.aEditedRows2[i].Fieldname && procsData[j].SectionId == this.aEditedRows2[i].SectionId &&
									procsData[j].SectionName == this.aEditedRows2[i].SectionName) {
									procsData[j].SectionId = this.getView().byId("cbs2").getSelectedKey();
									procsData[j].SectionName = "Section" + " " + this.getView().byId("cbs2").getSelectedKey();
									// procsData[i].SectionType
									var sectionData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavHeadToSection/results")
									var array = sectionData.filter(d => d.SectionId == parseInt(this.getView().byId("cbs2").getSelectedKey()));
									procsData[j].SectionSeqNum = array[0].SectionSeqNum;
									// this.lv_seq_tmp = this.lv_last_seq;
									procsData[j].Sequence = seq;
									seq = seq + 1;
									this.track.push({
										Fieldname: this.aEditedRows2[i].Fieldname,
										SectionId: this.getView().byId("cbs2").getSelectedKey()
									});
									break;
								}
							}
							this.onSChange();
							this.onTChange();
						}
					}
					seq = "";
				}
			}
		},
		onSChange: function (oEvent) {
			this.getView().getModel("viewData").setProperty("/processTableData", JSON.parse(JSON.stringify(this.getView().getModel(
					"viewData")
				.getProperty(
					"/PocessesTable/NavHeadToProcMaster/results"))));
			// this.sSelectedKey2 = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "cbs1").getSelectedKey();
			this.sSelectedKey2 = this.getView().byId("cbs1").getSelectedKey();
			var b = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.sSelectedKey2)];
			this.getView().byId("tableS").getBinding("items").filter(b);
		},
		onTChange: function (oEvent) {
			if (this.sSelectedKey2 == this.getView().byId("cbs2").getSelectedKey()) {
				oEvent.getSource().setSelectedKey("");
				var i = "Please select another section";
				MessageBox.error(i);
				return;
			}
			this.getView().getModel("viewData").setProperty("/processTableData2", this.getView().getModel("viewData").getProperty(
				"/PocessesTable/NavHeadToProcMaster/results"));
			var a = [new sap.ui.model.Filter("SectionId", sap.ui.model.FilterOperator.Contains, this.getView().byId("cbs2").getSelectedKey())];
			this.sectionId2 = this.getView().byId("cbs2").getSelectedKey();
			this.getView().byId("tableT").getBinding("items").filter(a);
		},

		onConfirmAlignD: function () {
			var pFlag1, sFlag1;
			var modelData = this.getView().getModel("viewData");
			var processData = modelData.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var sectionData = modelData.getProperty("/PocessesTable/NavHeadToSection/results");
			var cValue1 = this.sSelectedKey2;
			if (processData) {
				for (var i = 0; i < processData.length; i++) {
					if (processData[i].SectionId == cValue1) {
						// delete processData[i];
						processData.splice(i, 1);
						i--;
						pFlag1 = 1;
					}
				}
			}
			if (sectionData) {
				for (var j = 0; j < sectionData.length; j++) {
					if (sectionData[j].SectionId === cValue1) {
						// delete sectionData[i];
						sectionData.splice(j, 1);
						j--;
						sFlag1 = 1;
					}
				}
			}
			if (pFlag1 == 1 && sFlag1 == 1) {
				MessageBox.success("Section Deleted Succesfully");
			}
			modelData.refresh();
			this.getView().byId("cbs1").setSelectedKey(null);
			this.getView().byId("cbs2").setSelectedKey(null);
			// this._deleteSection.destroy(this);
			// this._deleteSection = undefined
			// this.getView().getModel("viewData").setProperty("/PocessesTable/NavHeadToProcMaster/results", JSON.parse(JSON.stringify(this.getView()
			// 	.getModel("viewData").getProperty(
			// 		"/processTableData"))));
			this._redelete.close(this);
			window.oTempCopy = [];
			window.oTempCopyS = [];
			this.getView().getModel("viewData").setProperty("/processTableData", {});
			this.getView().getModel("viewData").refresh();
			for (var h = 0; h < processData.length; h++) {
				for (var l = 0; l < this.track.length; l++) {
					if (processData[h].Fieldname == this.track[l].Fieldname && processData[h].SectionId == this.track[l].SectionId) {
						this.byId("idProcessTable").setSelectedItem(this.byId("idProcessTable").getItems()[h], true);
						this.track.splice(l, 1);
						break;
					}
				}
			}
		},
		onFNameChange: function () {
			var oModel = this.getView().getModel("viewData");
			// var aDomainValues = oModel.getProperty("/domainData/domainVlaues");
			var oDomain = oModel.getProperty("/domainData");
			var FName = sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").getSelectedKey()
			var processData = oModel.getProperty("/PocessesTable/NavHeadToProcMaster/results");
			var oDomainC = oModel.getProperty("/NavHeadToDomainCreate");
			var flag = "";
			if (oDomainC.length != 0) {
				$.each(oDomainC, function (k) {
					if (oDomainC[k].Fieldname == FName) {
						flag = "X";
						return false;
					}
				});
			}
			if (flag == "X") {
				MessageBox.error("Domain Value alreday assigned");
				sap.ui.core.Fragment.byId("myFragAssignDomainPop", "idFieldNameVal").setSelectedKey("")
			} else {
				for (var i = 0; i < processData.length; i++) {
					if (processData[i].Fieldname == FName) {
						oDomain.Datatype = processData[i].Datatype;
						oDomain.Length = processData[i].Length;
						break;

					}
				}
				oModel.refresh();
				flag = "";
				// this.getView().getModel("viewData").setProperty("/domainData", {});
			}
		},
		//FieldTYpe Change
		onFtypeChange: function (oEvent) {
			var oModel = this.getView().getModel("viewData");
			var valData = oModel.getProperty("/PocessesTable/NavHeadToValidation/results");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var j = oModel.getProperty(contextPath);
			var FType = j.Type;
			var cpy = window.oModelCopy.NavHeadToProcMaster.results;
			var orgData = cpy.filter(cpy => cpy.Fieldname == j.Fieldname && cpy.SectionName == j.SectionName);
			if (orgData.length != 0 && (orgData[0].Type == 'DD' || orgData[0].Type == 'SH')) {
				MessageBox.error("This Data Type cannot be changed");
				oEvent.getSource().getParent().getCells()[5].setSelectedKey(orgData[0].Type);
				return;
			} else {
				var DType = j.Datatype;
				var length = parseInt(j.Length);
				if (j.Datatype != "" || j.Length != "") {
					var array1 = valData.filter(d => d.DataType == DType);
					var array2 = array1.filter(d => d.FieldType == FType);
					if (array2.length == 0 || array2 == undefined) {
						// MessageBox.error("Please select appropriate Data Type");
						oEvent.getSource().getParent().getCells()[6].setValueState(sap.ui.core.ValueState.Error);
						// oModel.setProperty(`${contextPath}/dValState`, "Error");
						oEvent.getSource().getParent().getCells()[6].setValueStateText("Please select appropriate Data Type");
						oEvent.getSource().getParent().getCells()[5].setValueState("None");
						// oModel.setProperty(`${contextPath}/fValState`, "None");
						window.vs = 'X';
					} else {
						oEvent.getSource().getParent().getCells()[6].setValueState("None");
						// oModel.setProperty(`${contextPath}/dValState`, "None");
						oEvent.getSource().getParent().getCells()[5].setValueState("None");
						// oModel.setProperty(`${contextPath}/fValState`, "None");
						window.vs = "";
					}
					if (FType == "CB" && length != 1) {
						// MessageBox.error("Length must be 1");
						oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
						// oModel.setProperty(`${contextPath}/lValState`, "Error");
						oEvent.getSource().getParent().getCells()[7].setValueStateText("Length must be 1");
						window.vs = 'X';
					} else if (FType == "DF" && !(length >= 8 && length <= 10)) {
						// MessageBox.error("Length must be between 8 and 10");
						oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
						// oModel.setProperty(`${contextPath}/lValState`, "Error");
						oEvent.getSource().getParent().getCells()[7].setValueStateText("Length must be 8 OR 10");
						window.vs = 'X';
					} else if (j.Length < window.length && !(FType == "CB" || FType == "DF")) {
						// MessageBox.error("Length cannot be decreased");
						oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
						// oModel.setProperty(`${contextPath}/lValState`, "Error");
						oEvent.getSource().getParent().getCells()[7].setValueStateText("Length cannot be decreased below" + " " + window.length);
						window.vs = 'X';
					} else {
						oEvent.getSource().getParent().getCells()[7].setValueState("None");
						// oModel.setProperty(`${contextPath}/lValState`, "None");
					}
				}
			}
		},
		//DataType Change
		onDtypeChange: function (oEvent) {
			var oModel = this.getView().getModel("viewData");
			var valData = oModel.getProperty("/PocessesTable/NavHeadToValidation/results");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var j = oModel.getProperty(contextPath);
			var DType = j.Datatype;

			var FType = j.Type;
			var length = parseInt(j.Length);
			if (FType == "") {
				// MessageBox.error("Please select appropriate Field Type");
				oEvent.getSource().getParent().getCells()[5].setValueState(sap.ui.core.ValueState.Error);
				// oModel.setProperty(`${contextPath}/fValState`, "Error");
				oEvent.getSource().getParent().getCells()[5].setValueStateText("Please select appropriate Field Type");
				window.vs = 'X';
			} else {
				var array = valData.filter(d => d.FieldType == FType);
				if (array.length != 0 && array[0].DataType != DType) {
					// MessageBox.error("Please select appropriate Data Type");
					oEvent.getSource().getParent().getCells()[6].setValueState(sap.ui.core.ValueState.Error);
					// oModel.setProperty(`${contextPath}/dValState`, "Error");
					oEvent.getSource().getParent().getCells()[6].setValueStateText("Please select appropriate Data Type");
					window.vs = 'X';
				} else {
					oEvent.getSource().getParent().getCells()[6].setValueState("None");
					oEvent.getSource().getParent().getCells()[5].setValueState("None");
					// oModel.setProperty(`${contextPath}/dValState`, "None");
					// oModel.setProperty(`${contextPath}/fValState`, "None");
					window.vs = "";
				}
			}
			oModel.refresh();
		},
		//Live Length Change
		onLiveLengthChange: function (oEvent) {
			var oModel = this.getView().getModel("viewData");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var j = oModel.getProperty(contextPath);
			if (oEvent.getParameter("newValue") == "") {
				oEvent.getSource().getParent().getCells()[7].setValueState("Error");
			} else {
				if (contextPath != window.cPath || window.cPath == undefined) {
					window.length = parseInt(j.Length);
					window.cPath = contextPath;
				}
				oEvent.getSource().getParent().getCells()[7].setValueState("None");
			}
		},
		//Length Change
		onLengthChange: function (oEvent) {
			var oModel = this.getView().getModel("viewData");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var j = oModel.getProperty(contextPath);
			var FType = j.Type;
			var length = parseInt(j.Length);
			if (j.Length < window.length && !(FType == "CB" || FType == "DF")) {
				// MessageBox.error("Length cannot be decreased");
				oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
				// oModel.setProperty(`${contextPath}/lValState`, "Error");
				oEvent.getSource().getParent().getCells()[7].setValueStateText("Length cannot be decreased below" + " " + window.length);
				window.vs = 'X';
			} else {
				if (FType == "CB" && length != 1) {
					// MessageBox.error("Length must be 1");
					oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
					// oModel.setProperty(`${contextPath}/lValState`, "Error");
					oEvent.getSource().getParent().getCells()[7].setValueStateText("Length must be 1");
					window.vs = 'X';
				} else if (FType == "DF" && !(length == 8 || length == 10)) {
					// MessageBox.error("Length should be between 8 and 10");
					oEvent.getSource().getParent().getCells()[7].setValueState(sap.ui.core.ValueState.Error);
					// oModel.setProperty(`${contextPath}/lValState`, "Error");
					oEvent.getSource().getParent().getCells()[7].setValueStateText("Length should be between 8 and 10");
					window.vs = 'X';
				} else {
					oEvent.getSource().getParent().getCells()[7].setValueState("None");
					// oModel.setProperty(`${contextPath}/lValState`, "None");
					window.vs = "";
				}
			}
			oModel.refresh();
		},
		// onChangeGetRowIndices: function () {
		// 	MessageBox.error("Hi");
		// },
		callCrossApp: function () {
			// this.getView().setModel(this.getOwnerComponent().getModel());
			var parameters = {
				success: function () {
					this.getView().setBusy(false);
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					// generate the Hash to display a employee Id
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZFI_PMS_SOL_PREVIEW",
							action: "display"
						},
						params: {
							"projectId": this.sProject,
							"processId": this.sProcess,
							"projectDesc": this.getView().getModel("viewData").getProperty("/ProjTitle"),
							"processDesc": this.getView().getModel("viewData").getProperty("/processTitle"),
							"Preview": true
						}
					})) || "";
					//Generate a  URL for the second application
					var url = window.location.href.split('#')[0] + hash;
					//Navigate to second app
					sap.m.URLHelper.redirect(url, true);
				}.bind(this),
				error: function () {
					this.getView().setBusy(false);
				}.bind(this)
			};
			this.getView().getModel().read("/DynEntSet", parameters);
		},
		onSectionNameChange: function () {
			var viewModel = this.getView().getModel("viewData");
			var sectData = viewModel.getProperty("/PocessesTable/NavHeadToSection/results");
			this.t = sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").getValue();
			var sameSec = sectData.filter(sectData => sectData.SectionName == this.t);
			if (sameSec.length != 0) {
				var sNameFlag = 1;
			}
			// for (var i = 0; i < sectData.length; i++) {
			// 	if (sectData[i].SectionName == this.t) {
			// 		var sNameFlag = 1;
			// 		break;
			// 	}
			// }
			if (sNameFlag == 1) {
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.Error);
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueStateText("Section Name already exists");
			} else {
				var lastSeq = sectData.reduce(function (prev, current) {
					return (prev.SectionSeqNum > current.SectionSeqNum) ? prev : current
				});
				var seq = lastSeq.SectionSeqNum + 1;
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSequencenoVal").setValue(seq);
				sap.ui.core.Fragment.byId("myFragAddSectionPop", "idSectionNameVal").setValueState(sap.ui.core.ValueState.None);
			}
		},
		// onSeqChange: function (oEvent) {
		// 	var oModel = this.getView().getModel("viewData");
		// 	var contextPath = oEvent.getSource().getParent().getBindingContextPath();
		// 	var aContextPath = oEvent.getSource().getParent().getParent().getBindingInfo("items").path
		// 	var j = oModel.getProperty(aContextPath);
		// 	var h = oModel.getProperty(contextPath);
		// 	var array = j.filter(j => j.Sequence == h.Sequence && j.SectionName == h.SectionName);
		// 	if (array.length != 1) {
		// 		oEvent.getSource().getParent().getCells()[8].setValueState("Error");
		// 		oEvent.getSource().getParent().getCells()[8].setValueStateText("Sequence Number alreday exists");
		// 	} else {
		// 		oEvent.getSource().getParent().getCells()[8].setValueState("None");
		// 	}
		// },
		domainLiveChange: function (oEvent) {
			var defLength = parseInt(oEvent.getSource().getParent().getParent().getParent().getFields()[2].getItems()[2].getValue());
			if (oEvent.getSource().getValue().length > defLength) {
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText("Value length exceeded, please check Length again");
				window.domErr = "X";
			} else {
				oEvent.getSource().setValueState("None");
				window.domErr = "";
			}
		},
		handleLNameSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("LabelName", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},
		handleFNameSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("Fieldname", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		},
		handleSNameSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter("SectionName", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		}
	});
});