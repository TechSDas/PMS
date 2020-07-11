sap.ui.define([
	"../controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("fi.pms.solution.ZFI_PMS_SOL.controller.MainAdmin", {
		SmartFormCollection: [],
		onInit: function () {
			//Declaring Model
			//Addded / Changed by Varun
			var that = this;
			var oDataModelINIT = this.getOwnerComponent().getModel("INIT"); //ZAVI_GW_INIT_STAT_UI_SRV
			var viewModel = this.getOwnerComponent().getModel("viewData");
			var oVisibilityModel = this.getOwnerComponent().getModel("visibilityModel");
			//Added by Varun - On load 
			//Setting visibility of Project Dropdown
			oVisibilityModel.setProperty("/visible", false);
			//Setting Visibility of Timesheet tiles
			oVisibilityModel.setProperty("/UserTilesVisible", false);
			oVisibilityModel.setProperty("/UserPreviewFormVisible", false);
			oVisibilityModel.setProperty("/userRole", []);

			if (!oDataModelINIT.isMetadataLoadingFailed()) {

				this.oDataModel = this.getOwnerComponent().getModel();
				oDataModelINIT.read("/UserDetailsSet('')", { //Happy
					success: function (oData) {
						//Calling the function to get Project values
						this._getProjectSet(); //Happy
						oVisibilityModel.setProperty("/visible", true);
						oVisibilityModel.setProperty("/userRole", oData.Role);
						viewModel.setProperty("/userName", oData.UserName); //Happy
						viewModel.refresh();
						//Get the Processes

					}.bind(this),
					error: function (oError) {
						that.BusyIndicator.hide();
					}.bind(this)
				});
			} else {
				this.MessageToast.show("Error while loading the application");
			}

		},

		onChange: function (oEvent) {
			this.sProject = oEvent.getParameters().selectedItem.getText(); //commented : Subhajit
			this.oProject = this.getView().byId("idSelectProject").getSelectedKey(); //added : Subhajit
			// var oUserTileContent = this.getView().byId("idUserTile").getTileContent()[0];
			// var oProcessTileContent = this.getView().byId("idProcessTile").getTileContent()[0];
			this.getView().getModel("viewData").setProperty("/ProjTitle", this.sProject); //Happy
			this.getOwnerComponent().getModel("viewData").setProperty("/ProjectId", this.oProject); //Happy
			this.getView().byId('idSelectProcess').setSelectedKey("");
			this.onChangeProcess();
			this._getUserProcessSet(); //Happy
			this.getUserTileCount(); // Added by Varun on 10 Feb 2020.
		},

		//Function Added by Varun on 11 Feb 2020
		//Function is added to set visibility of Timesheet tiles on user login.
		onChangeProcess: function () {
			var sProcessKey = this.getView().byId('idSelectProcess').getSelectedKey();
			var oVisibilityModel = this.getOwnerComponent().getModel("visibilityModel");

			if (sProcessKey === "10") {
				oVisibilityModel.setProperty("/UserTilesVisible", true);
			} else {
				oVisibilityModel.setProperty("/UserTilesVisible", false);
			}
			if (sProcessKey === "1") {
				this.getUserFormData();
			} else {
				oVisibilityModel.setProperty("/UserPreviewFormVisible", false);
			}
		},

		onAddProcess: function (oEvt) {
			if (!this._AddProcessPop) {
				this._AddProcessPop = sap.ui.xmlfragment(this.getView().getId(), "fi.pms.solution.ZFI_PMS_SOL.Fragments.AddProcess", this);
				this.getView().addDependent(this._AddProcessPop);
			}
			this._AddProcessPop.openBy(oEvt.getSource());
		},
		navToProcess: function (oEvent) {

			var oRouter = this.UIComponent.getRouterFor(this);
			oRouter.navTo("Process", {
				project: this.oProject
			});
		},
		navToUser: function (oEvent) {
			var oRouter = this.UIComponent.getRouterFor(this);
			oRouter.navTo("User");
		},
		_getUserProcessSet: function () { //Happy
			var f = [];
			var that = this;
			var viewModel = this.getView().getModel("viewData");
			var viewModelData = this.getView().getModel("viewData").getData();
			var ProjectId = this.getView().byId("idSelectProject").getSelectedKey();

			if (ProjectId) {
				f.push(new sap.ui.model.Filter("Projid", "EQ", ProjectId));
			} else {
				f.push(new sap.ui.model.Filter("Projid", "EQ", viewModelData.Projects[0].ProjectId));
			}

			this.BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/UserProcessSet", {
				filters: f, //read call to fetch table data
				success: function (oData) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					viewModel.setProperty("/Pocesses", oData.results);
					viewModel.setProperty("/ProcessCount", oData.results.length);
					viewModel.refresh();

				},
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
			//Commented by Vaurn Jain on 03-03-2020
			// this.oProject = viewModelData.Projects[0].ProjectId; // added Subhajit
			this.BusyIndicator.hide(); //Hiding Busy Indicator
		},

		//Function Added by Varun for Showing the user count on User Tile/
		//Added on 10 Feb 2020

		getUserTileCount: function () {

			//Filter object creation
			var that = this;
			var oFilter = [];
			var oViewModel = this.getView().getModel("viewData");
			var oViewModelData = oViewModel.getData();
			var sProjectId = this.getView().byId("idSelectProject").getSelectedKey();

			if (sProjectId) {
				oFilter.push(new sap.ui.model.Filter("Projectid", "EQ", sProjectId));
			} else {
				oFilter.push(new sap.ui.model.Filter("Projectid", "EQ", oViewModelData.Projects[0].ProjectId));
			}

			this.BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/F4ProjUsersSet", {
				filters: oFilter, //read call to fetch table data
				success: function (oData) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator

					oViewModel.setProperty("/UserCount", oData.Count);
					oViewModel.refresh();

				},
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
			this.BusyIndicator.hide(); //Hiding Busy Indicator
		},

		_getUser: function () {
			var that = this;
			this.BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/UserDetailsSet('')", { //Happy
				//	filters: f, //read call to fetch table data
				success: function (oData) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					that.getView().getModel("viewData").setProperty("/PocessesTable", oData.results);
					// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));
					//Rachana Kamath Changes
				},
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
			// BusyIndicator.hide(); //Hiding Busy Indicator
		},
		_getProjectSet: function () { //Happy
			var that = this;
			this.BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").read("/ProjectDetailsSet", {
				// filters: f, //read call to fetch table data
				success: function (oData) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					that.getView().getModel("viewData").setProperty("/Projects", oData.results); //update the model
					var viewModel = that.getView().getModel("viewData");
					viewModel.setProperty("/ProjTitle", viewModel.getData().Projects[0].ProjectDesc); //Happy
					viewModel.refresh(); //Happy
					if (viewModel.getProperty("/Projects/0/ProjectId")) {
						this.oProject = viewModel.getProperty("/Projects/0/ProjectId");
						// if (viewModel.Projects[0]) {
						// 	this.oProject = viewModel.Projects[0].ProjectId;
						// }
						this._getUserProcessSet();
						this.getUserTileCount();
					}
				}.bind(this),
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
		},
		/*	Rachana Start of Changes*/
		handleCloseButton: function (e) {
			this.getView().byId("idProcessNameVal").setValue("");
			this._AddProcessPop.close();
		},
		handleSaveButton: function (oEvt) {
			//Changes by Amol Vaity to remove project id from view.
			//only processname sending back to service
			//project id will be generated  from backend
			var that = this;
			var oInputControl = this.getView().byId("idProcessNameVal");
			var ProjectDesc = oInputControl.getValue();
			if (ProjectDesc) {
				oInputControl.setValueState(sap.ui.core.ValueState.None);
			} else {
				oInputControl.setValueState(sap.ui.core.ValueState.Error);
				return;
			}

			oInputControl.setValue("");
			this._AddProcessPop.close();

			var payload = {
				ProjectDesc: ProjectDesc
			};

			this.getOwnerComponent().getModel("INIT").create("/ProjectDetailsSet", payload, {
				success: function (oData, response) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var msg = "Project Successfully Added";
					that.MessageBox.success(msg);
					this._getProjectSet();

				}.bind(this),
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
		},
		onMyTimesheetClick: function () {
			var oRouter = this.UIComponent.getRouterFor(this);
			oRouter.navTo("View1");
		},
		onResAvailabilityClick: function () {
			var oRouter = this.UIComponent.getRouterFor(this);
			oRouter.navTo("viewTask");
		},
		onNewTaskAllocClick: function () {
			var oRouter = this.UIComponent.getRouterFor(this);
			oRouter.navTo("viewAdd");
		},

		//BOC Happy

		getUserFormData: function () {
			var that = this;
			//BOC Happy -- 3 March 2020
			var ProjectId = this.getView().byId("idSelectProject").getSelectedKey();
			var ProcessId = this.getView().byId("idSelectProcess").getSelectedKey();
			//EOC Happy -- 3 March 2020

			var body = {
				Projid: ProjectId,
				Process: ProcessId,
				Indicator: "U",
				"NavHeadToSection": [],
				"NavHeadToProcMaster": [],
				"NavHeadToDomainCreate": []
			};

			this.BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("INIT").create("/HeaderDetailsSet", body, {
				success: function (oData, response) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					if (oData.NavHeadToProcMaster.results.length > 0) {
						/*that.getView().getModel("dynamicFormModel").setData(oData);
						that.SmartFormCollection = [];
						that.createSmartForm();*/
						that.callCrossApp();
					}
				},
				error: function (oError) {
					that.BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
		},

		createSmartForm: function () {
			this.BusyIndicator.show(); //Starting Busy Indicator
			var paramertes = {
				success: function () {
					this.getView().getModel().metadataLoaded().then(function () {
						this.oVirtualEntryContext = this.getView().getModel().createEntry("DynEntItemSet");
						this.getView().byId("userSmartFormContainer").setBindingContext(this.oVirtualEntryContext);
						this._createSmartFormElements(); // function to create all the controls in the view
					}.bind(this));
					this.getView().getModel().refreshMetadata();
				}.bind(this)
			};
			this.getView().getModel().read("/DynEntSet", paramertes);
		},

		_createSmartFormElements: function () {
			this.getView().setBusy(true);
			//this is the reponse data of preview service, using as metadata to create all the controls
			var aFormData = this.getOwnerComponent().getModel("dynamicFormModel").getData().NavHeadToProcMaster.results;
			//smartFormContainer container 
			var smartFormContainer = this.getView().byId("userSmartFormContainer");
			// removing all the controls in smartFormContainer
			smartFormContainer.removeAllSections();
			//calling a function to creatie smart form or talble control according to sectionType
			var smartForm = this._createSectionControl(aFormData[0].SectionType);

			// var ObjectPageSection =  this._createObjectPageSection;

			if (aFormData[0].SectionType.toUpperCase() === "FORM") {
				// if section type is form creating group with header
				var oGroup = new this.SmartFormGroup({
					// "label": aFormData[0].SectionName
				});
			} else if (aFormData[0].SectionType.toUpperCase() === "TABLE") {
				// if section type is Table setting header to table and creating columnlistitem
				// smartForm.setHeaderText(aFormData[0].SectionName);
				var columnList = new sap.m.ColumnListItem({

				});
			}

			//logic to read all the fields aFormData and creating smartfields smartfrom and table
			var sSecSeqNo = parseInt(aFormData[0].SectionSeqNum);
			for (var i = 0; i < aFormData.length; i++) {
				if (aFormData[i].Fieldname === "PROCESS_ID" || aFormData[i].Fieldname === "PROJECT_ID") {
					continue;
				} else {
					if (sSecSeqNo !== parseInt(aFormData[i].SectionSeqNum)) {
						sSecSeqNo = parseInt(aFormData[i].SectionSeqNum);
						if (aFormData[i - 1].SectionType.toUpperCase() === "FORM") {
							smartForm.addGroup(oGroup);
							this._createObjectPageSection(smartForm, aFormData[i - 1].SectionName);
							// smartFormContainer.addItem(smartForm);
						} else if (aFormData[i - 1].SectionType.toUpperCase() === "TABLE") {
							smartForm.addItem(columnList);
							// smartFormContainer.addItem(smartForm);
							this._createObjectPageSection(smartForm, aFormData[i - 1].SectionName);
						}
						smartForm = this._createSectionControl(aFormData[i].SectionType);
						if (aFormData[i].SectionType.toUpperCase() === "FORM") {
							var oGroup = new this.SmartFormGroup({
								// "label": aFormData[i].SectionName
							});
						} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {
							// smartForm.setHeaderText(aFormData[i].SectionName);
							var columnList = new this.ColumnListItem({

							});
						}

					}
					if (aFormData[i].SectionType.toUpperCase() === "FORM") {
						var oSmartField = new this.SmartField({
							"value": '{' + aFormData[i].Fieldname + '}'
						});
						var oGroupElement = new this.SFGroupElement();
						oGroupElement.addElement(oSmartField);
						oGroup.addGroupElement(oGroupElement);
					} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {

						var column = new sap.m.Column({
							header: new sap.m.Text({
								text: aFormData[i].LabelName
							})
						});
						columnList.addCell(
							new this.SmartField({
								"value": '{' + aFormData[i].Fieldname + '}'
							})
						);
						smartForm.addColumn(column);
					}
				}
			}
			if (aFormData[aFormData.length - 1].SectionType.toUpperCase() === "FORM") {
				smartForm.addGroup(oGroup);
				// smartFormContainer.addItem(smartForm);
				this._createObjectPageSection(smartForm, aFormData[aFormData.length - 1].SectionName);
			} else if (aFormData[aFormData.length - 1].SectionType.toUpperCase() === "TABLE") {
				smartForm.addItem(columnList);
				// smartFormContainer.addItem(smartForm);
				this._createObjectPageSection(smartForm, aFormData[aFormData.length - 1].SectionName);
			}
			// smartForm.addGroup(oGroup);
			var oVisibilityModel = this.getView().getModel("visibilityModel");
			oVisibilityModel.setProperty("/UserPreviewFormVisible", true);
			oVisibilityModel.refresh();
			this.BusyIndicator.hide(); //Hiding Busy Indicator
			this.getView().setBusy(false);
			// this.hideBusyDialog();
		},

		_createSectionControl: function (sectionType) {
			var oControl;
			if (sectionType.toUpperCase() === "FORM") {
				oControl = new this.SmartForm({
					editTogglable: false,
					entityType: "DynEntItem",
					editable: true,
					layout: new this.SFColumnLayout({
						columnsXL: 4,
						columnsL: 3,
						columnsM: 2,
						labelCellsLarge: 4,
						emptyCellsLarge: 0
					}),
					useHorizontalLayout: false
				});
				this.SmartFormCollection.push(oControl);
				return oControl;
			} else if (sectionType.toUpperCase() === "TABLE") {
				oControl = new sap.m.Table({
					inset: false
				});
				return oControl;
			}

		},
		_createObjectPageSection: function (oControl, SectionName) {

			var objectPageSection = new sap.uxap.ObjectPageSection({
				title: SectionName,
				subSections: new sap.uxap.ObjectPageSubSection({
					blocks: oControl
				})
			});
			this.getView().byId("userSmartFormContainer").addSection(objectPageSection);

		},

		onUserFormSave: function (oEvent) {
			var mandatFlag = false;
			for (var i = 0; i < this.SmartFormCollection.length; i++) {
				if (this.SmartFormCollection[i].check().length > 0) {
					mandatFlag = true;
					this.MessageToast.show(this.getI18nText("fillMandatFields"));
					break;
				}
			}
			if (!mandatFlag) {
				var that = this;
				var changedData = this.getView().getModel().getProperty(this.oVirtualEntryContext.sPath);
				var ProjectId = this.getView().byId("idSelectProject").getSelectedKey();
				var ProcessId = this.getView().byId("idSelectProcess").getSelectedKey();
				changedData.PROJECT_ID = ProjectId;
				changedData.PROCESS_ID = ProcessId;
				delete changedData.__metadata;
				var body = {
					PROJECT_ID: ProjectId,
					PROCESS_ID: ProcessId,
					Nav_DynEntToDynEntItem: [changedData]
				};

				this.BusyIndicator.show(); //Starting Busy Indicator
				this.getOwnerComponent().getModel().create("/DynEntSet", body, {
					success: function (oData, response) {
						that.BusyIndicator.hide(); //Hiding Busy Indicator
						that.MessageBox.success(
							"Saved Successfully. Do you want to create another RICEF?", {
								actions: [that.MessageBox.Action.YES, that.MessageBox.Action.NO],
								onClose: function (sAction) {
									if (sAction === that.MessageBox.Action.YES) {
										that.getUserFormData();
									} else if (sAction === that.MessageBox.Action.NO) {
										that.getView().byId('idSelectProcess').setSelectedKey("");
										that.onChangeProcess();
									}
								}
							}
						);
					},
					error: function (oError) {
						that.BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						that.MessageBox.error(msg); //Displaying Error Message in Dialog Box
					}
				});

			}
		},

		callCrossApp: function () {
			// this.getView().setModel(this.getOwnerComponent().getModel());
			var parameters = {
				success: function () {
					this.getView().setBusy(false);
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					// generate the Hash 
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZFI_PMS_SOL_PREVIEW",
							action: "display"
						},
						params: {
							"projectId": this.getView().byId("idSelectProject").getSelectedKey(),
							"processId": this.getView().byId("idSelectProcess").getSelectedKey(),
							"projectDesc": this.getView().byId("idSelectProject").getSelectedItem().getText(),
							"processDesc": this.getView().byId("idSelectProcess").getSelectedItem().getText(),
							"Preview": false
						}
					})) || "";
					//Generate a  URL for the second application
					var url = window.location.href.split('#')[0] + hash;
					//Navigate to second app
					sap.m.URLHelper.redirect(url, true);

					/*oCrossAppNavigator.toExternal({
						target: {
							shellHash: hash
						}
					});*/ // navigate to Supplier application
				}.bind(this),
				error: function () {
					this.getView().setBusy(false);
				}.bind(this)
			};
			this.getView().getModel().read("/DynEntSet", parameters);

		}

	});
});