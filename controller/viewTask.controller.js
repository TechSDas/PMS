sap.ui.define([
	"fi/pms/solution/ZFI_PMS_SOL/model/models",
	"sap/ui/core/mvc/Controller",
	'sap/ui/unified/DateRange', 'sap/ui/unified/CalendarLegendItem',
	'sap/ui/unified/DateTypeRange'
], function (models, Controller, DateRange, CalendarLegendItem, DateTypeRange) {
	"use strict";

	var CalendarSingleDaySelectionController = Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.viewTask", {
		oStartDate1: "" ,  
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ZDPMT_TimeSheet.TimeSheet.view.viewTask
		 */
		onInit: function () {
			this.router = sap.ui.core.UIComponent.getRouterFor(this);
			this.router.attachRoutePatternMatched(this.onRouteMatched, this);
		},

		onRouteMatched: function (oEvent) {
			var viewModel = this.getOwnerComponent().getModel("viewData");
			this.projectId = viewModel.getProperty("/ProjectId");
			
			if (this.projectId === undefined) {
				this.router.navTo("TargetMainAdmin");
				return;
			}
			
			this._getData();
			this._getData3();

			var oMasterData2 = {
				"UserScreen2": ({
					"UserID": "ID1"
				}, {
					"UserID": "ID2"
				})
			};
			var viewData = new sap.ui.model.json.JSONModel(oMasterData2);
			this.getView().setModel(viewData, "viewData1");
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd",
				calendarType: sap.ui.core.CalendarType.Gregorian
			});
			/*var oCal1 = this.byId("calendar");*/
			var oLeg1 = this.byId("legend1");
			oLeg1.destroyItems();
			oLeg1.addItem(new CalendarLegendItem({
				text: "Task  Assigned",
				type: "Type10",
				color: "yellow"
			}));
			oLeg1.addItem(new CalendarLegendItem({
				text: "Available",
				type: "Type08",
				color: "green"
			}));
			oLeg1.addItem(new CalendarLegendItem({
				text: "PTO / Holiday",
				type: "Type02",
				color: "orange"
			}));
		},

		// BOC - Azhar
		// Value help for Task ID
		onValueHelpRequestID: function (oEvent) {
			if (!this._taskDialog) {
				this._taskDialog = sap.ui.xmlfragment(
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.taskID",
					this
				);
				this.getView().addDependent(this._taskDialog);
				this._taskDialog.open();
			}
			this._taskDialog.open();
		},

		// Search Tasks
		_handleValueTaskSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Bname",
				sap.ui.model.FilterOperator.Contains, sValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		// Select and confirm the Task ID
		_handleValueTaskConfirm: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var vUserId = this.getView()
					.byId("costCenterId");
				vUserId.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		onValueHelpRequestUserID: function (oEvent) {
			if (!this._userDialog) {
				this._userDialog = sap.ui.xmlfragment(
					"fi.pms.solution.ZFI_PMS_SOL.Fragments.UserID",
					this
				);
				this.getView().addDependent(this._userDialog);
				this._userDialog.open();
			}
			this._userDialog.open();
		},

		_handleValueUserSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new sap.ui.model.Filter("Bname",
				sap.ui.model.FilterOperator.Contains, sValue);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		// Select and confirm the Task ID
		_handleValueUserConfirm: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var vUserId = this.getView()
					.byId("costCenterId");
				vUserId.setValue(oSelectedItem.getTitle());
				this._getIndicator(this.oStartDate1);
			}
			evt.getSource().getBinding("items").filter([]);
		},
		// EOC - Azhar
		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				oStartDate = oSelectedDate.getStartDate(),
				oYear = oStartDate.getFullYear(),
				oYear = String(oYear),
				oMonth = oStartDate.getMonth() + 1,
				oMonth = String(oMonth),
				oDate = oStartDate.getDate();
			if (oDate < 10)
				oDate = String("0" + oDate);
			else
				oDate = String(oDate);

			var oDate1 = oYear + oMonth + oDate;
			this.oStartDate1 = oStartDate ;

			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
		/*	this._getData2("2020-01-22T00:00:00");*/
		this._getData2(oStartDate);
			if (this.oLastSelectedJSDate && oStartDate.getTime() === this.oLastSelectedJSDate.getTime()) {
				oCalendar.removeSelectedDate(oSelectedDate);
				this.oLastSelectedJSDate = null;
			} else {
				this.oLastSelectedJSDate = oStartDate;
			}

		},

		_getData2: function (oDate1) {
			var that = this;
			var f = [];
			var selectedUser = this.getView().byId("costCenterId").getValue();
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Userid", "EQ", selectedUser));
			// f.push(new sap.ui.model.Filter("Role", "EQ", "XYZ"));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			/*Datefield: "20191212"*/
			 f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));

			// BOC - Azhar
			var entitySet = "TimeSheetItemSet";
			models.readAndSetModel(that, entitySet, "viewData", that.setModelBack, f);
			// EOC - Azhar
		},

		// BOC - Azhar
		/*setModelBack: function (data, modelName, entitySet) {
			var vController = this;
			var oView = vController.getView();
			if (entitySet === "TimeSheetItemSet") {
				oView.getModel("viewData").setProperty("/UserScreen", data.results);
			}
		},*/

		//sap/opu/odata/sap/ZDPMT_GW_INIT_STAT_UI_SRV/F4TaskidsSet?$filter=Projectid eq 'TEST2' and Processid eq '2' and Ricefid eq ''
		_getData: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			/*Datefield: "20191212"*/
			/*	f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));*/

			// BOC - Azhar
			var entitySet = "F4TaskidsSet";
			models.readAndSetModel(that, entitySet, "taskIdModel", that.setModelBack, f);
			// EOC - Azhar

		},
		_getData3: function () {
			var that = this;
			var f = [];
			
			// BOC - Azhar
			var entitySet = "F4SystemUsersSet";
			models.readAndSetModel(that, entitySet, "userIdModel", that.setModelBack, f);
			// EOC - Azhar

		},
		_getIndicator: function (oDate1) {
			var that = this;
			var f = [];
			var selectedUser = this.getView().byId("costCenterId").getValue();
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Userid", "EQ", selectedUser));
			/*f.push(new sap.ui.model.Filter("Ricefid", "EQ", "DEV123"));*/
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			f.push(new sap.ui.model.Filter("Date", "GE", oDate1));
			f.push(new sap.ui.model.Filter("Date", "LE", oDate1));
			/*Datefield: "20191212"*/
			/*	f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));*/

			// BOC - Azhar
			var entitySet = "DateIndicatorsSet";
			models.readAndSetModel(that, entitySet, "dateIdModel", that.setModelBack, f);

		},
		// BOC - Azhar
		setModelBack: function (data, modelName, entitySet) {
			var vController = this;
			var oView = vController.getView();
			if (entitySet === "TimeSheetItemSet") {
				oView.getModel("viewData").setProperty("/UserScreen", data.results);
			}
			if (entitySet === "F4TaskidsSet") {
				var oTaskIdF4 = new sap.ui.model.json.JSONModel();
				oTaskIdF4.setData(data);
				this.getView().setModel(oTaskIdF4, modelName);
				this.getView().getModel(modelName).refresh();
			}
			if (entitySet === "F4SystemUsersSet") {
				var oTaskIdF4Sys = new sap.ui.model.json.JSONModel();
				oTaskIdF4Sys.setData(data);
				this.getView().setModel(oTaskIdF4Sys, modelName);
				this.getView().getModel(modelName).refresh();
			}

			if (entitySet === "DateIndicatorsSet") {
				var oCal1 = this.byId("calendar");
				// var oLeg1 = this.byId("legend1");
				var oRefDate = new Date();
				for (var i = 0; i < data.results.length; i++) {
					var status;
					if (data.results[i].Indicator === "AVL") {
						status = "Type08";
					} else if (data.results[i].Indicator === "PTO") {
						status = "Type02";
					} else if (data.results[i].Indicator === "OCP") {
						status = "Type10";
					}
					oCal1.addSpecialDate(new DateTypeRange({
						startDate: new Date(oRefDate.setDate(data.results[i].Date.getDate())),
						type: status,
						tooltip: data.results[i].Indicator
					}));

				}
			}
		},

		_updateText: function (oCalendar) {
			var oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate;
			var oMasterData = {
				"UserScreen": [{
					"RICEF": "ID1",
					"Task": "Task 1",
					"TaskMisc": "PTO",
					"Hours": "45",
					"Availability": "20",
					"Worked": "",
					"HoursBook": "",
					"Comment": "Task for RICEF Track"
				}]
			};
			if (aSelectedDates.length > 0) {
				oDate = aSelectedDates[0].getStartDate();
				var viewData = new sap.ui.model.json.JSONModel(oMasterData);
				this.getView().setModel(viewData, "viewData");
				oText.setText(this.oFormatYyyymmdd.format(oDate));
			} else {
				oText.setText("No Date Selected");
			}
		},
		onBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TargetMainAdmin");

		},
		onAddRow: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("viewAdd");
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ZDPMT_TimeSheet.TimeSheet.view.viewTask
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ZDPMT_TimeSheet.TimeSheet.view.viewTask
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ZDPMT_TimeSheet.TimeSheet.view.viewTask
		 */
		//	onExit: function() {
		//
		//	}

	});
	return CalendarSingleDaySelectionController;
});