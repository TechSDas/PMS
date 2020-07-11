// <!--change by Amol vaity-->
// <!--dynamic form screen-->
// <!--All control are developed from js file-->
sap.ui.define([
	// "sap/ui/core/mvc/Controller",
	"fi/pms/solution/ZFI_PMS_SOL/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/ui/comp/smartform/SmartForm",
	"sap/ui/comp/smartform/Layout",
	"sap/ui/comp/smartform/ColumnLayout",
	"sap/ui/comp/smartform/Group"
], function (BaseController, History, SmartForm, Layout, ColumnLayout, Group) {
	"use strict";

	return BaseController.extend("fi.pms.solution.ZFI_PMS_SOL.controller.smartTable", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf fi.pms.solution.ZFI_PMS_SOL.view.smartTable
		 */
		onInit: function () {

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("smartTable").attachPatternMatched(this._onObjectMatched, this);

			// if (this.getModel().hasPendingChanges()) {
			// 	this.getModel().submitChanges({
			// 		success: function (oResponse) {
			// 			this.fnCheckAlltheResponse(oResponse, "");
			// 		}.bind(this),
			// 		error: function (oError) {
			// 			this.getModel().resetChanges();
		},

		_onObjectMatched: function () {
			// this.getView().setModel(this.getOwnerComponent().getModel());
			var paramertes = {
				success: function () {
					// this.getView().getModel().metadataLoaded().then(function () {
					// 	this.oVirtualEntryContext = this.getView().getModel().createEntry("DynEntItemSet");
					// 	// setting binding context to "smartFormContainer" i.e VBOXs
					// 	// this.getView().byId("smartFormContainer").setBindingContext(this.oVirtualEntryContext);
					// 	this._createSmartFormElements(); // function to create all the controls in the view
					// }.bind(this));

					this.getView().getModel().refreshMetadata(true).then(function () {
						this.oVirtualEntryContext = this.getView().getModel().createEntry("DynEntItemSet");
						// setting binding context to "smartFormContainer" i.e VBOXs
						// this.getView().byId("smartFormContainer").setBindingContext(this.oVirtualEntryContext);
						this._createSmartFormElements(); // function to create all the controls in the view
					}.bind(this));
				}.bind(this)
			};
			this.getView().getModel().read("/DynEntSet", paramertes);

		},

		_createSmartFormElements: function () {

			this.getView().setBusy(true);
			//this is the reponse data of preview service, using as metadata to create all the controls
			var aFormData = this.getOwnerComponent().getModel("dynamicFormModel").getData().NavHeadToProcMaster.results;
			//smartFormContainer container 
			var smartFormContainer = this.getView().byId("smartFormContainer");
			// removing all the controls in smartFormContainer
			smartFormContainer.removeAllSections();
			//calling a function to creatie smart form or talble control according to sectionType
			var smartForm = this._createSectionControl(aFormData[0].SectionType);

			// var ObjectPageSection =  this._createObjectPageSection;

			if (aFormData[0].SectionType.toUpperCase() === "FORM") {
				// if section type is form creating group with header
				var oGroup = new Group({
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
						var oGroup = new Group({
							// "label": aFormData[i].SectionName
						});
					} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {
						// smartForm.setHeaderText(aFormData[i].SectionName);
						var columnList = new sap.m.ColumnListItem({

						});
					}

				}
				if (aFormData[i].SectionType.toUpperCase() === "FORM") {
					var oSmartField = new sap.ui.comp.smartfield.SmartField({
						"value": '{' + aFormData[i].Fieldname + '}'
							// "value": "{PROJECT_ID}"
					});
					var oGroupElement = new sap.ui.comp.smartform.GroupElement();
					oGroupElement.addElement(oSmartField);
					oGroup.addGroupElement(oGroupElement);
				} else if (aFormData[i].SectionType.toUpperCase() === "TABLE") {

					var column = new sap.m.Column({
						header: new sap.m.Text({
							text: aFormData[i].LabelName
						})
					});
					columnList.addCell(
						new sap.ui.comp.smartfield.SmartField({
							"value": '{' + aFormData[i].Fieldname + '}'
						})
					);
					smartForm.addColumn(column);
				}

			}
			// var oSmartField = new sap.ui.comp.smartfield.SmartField({
			// 	"value": "{TEST_CB}"
			// });
			// var oGroupElement = new sap.ui.comp.smartform.GroupElement();

			// oGroupElement.addElement(oSmartField);
			// oGroup.addGroupElement(oGroupElement);
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
			this.getView().setBusy(false);
			this.hideBusyDialog();
		},

		_createSectionControl: function (sectionType) {
			var oControl;
			if (sectionType.toUpperCase() === "FORM") {
				oControl = new sap.ui.comp.smartform.SmartForm({
					// id: "smartFormColumn",
					editTogglable: false,
					entityType: "DynEntItem",
					editable: true,
					layout: new sap.ui.comp.smartform.ColumnLayout({
						columnsXL: 4,
						columnsL: 3,
						columnsM: 2,
						labelCellsLarge: 4,
						emptyCellsLarge: 0
					}),
					useHorizontalLayout: false
				});
				oControl.addStyleClass("pointerClass");
				oControl.setBindingContext(this.oVirtualEntryContext);
				return oControl;
			} else if (sectionType.toUpperCase() === "TABLE") {
				oControl = new sap.m.Table({
					inset: false
				});
				oControl.addStyleClass("pointerClass");
				oControl.setBindingContext(this.oVirtualEntryContext);
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
			this.getView().byId("smartFormContainer").addSection(objectPageSection);

		},

		onBack: function () {

			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			}

		}

	});

});