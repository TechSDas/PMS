sap.ui.define([
	"fi/pms/solution/ZFI_PMS_SOL/model/models",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportType',
	"sap/ui/core/util/ExportTypeCSV",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	'sap/m/MessageBox',
	"sap/ui/core/UIComponent",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/routing/History"
], function (models, Controller, JSONModel, Export, ExportType, ExportTypeCSV, Spreadsheet, MessageToast, MessageBox, UIComponent,
	BusyIndicator, History) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.View1", {

		oFormatYyyymmdd: null,
		oSelectedDate1: "",
		valueFlag: null,

		onInit: function (oEvent) {
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

			sap.ui.core.LocaleData.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()).mData[
				"weekData-firstDay"] = 6;

			var o = this.getView().byId("calendar");

			var today = o.getStartDate();

			var goBack = (today.getDay() + 6) % 7;

			var lastMonday = new Date().setDate(today.getDate() - goBack);

			var desiredDate = new Date(lastMonday);
			o.setStartDate(desiredDate);
			this.oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-dd",
				calendarType: sap.ui.core.CalendarType.Gregorian
			});
		},

		handleCalendarSelect: function (oEvent) {
			var oCalendar = oEvent.getSource(),
				oSelectedDate = oCalendar.getSelectedDates()[0],
				oStartDate = oSelectedDate.getStartDate(),
				oYear = oStartDate.getFullYear(),
				/*oYear = String(oYear),*/
				oMonth = oStartDate.getMonth() + 1;
			/*if (oMonth < 10)
				oMonth = String("0" + oMonth);
			else
				oMonth = String(oMonth);*/

			var oDate = oStartDate.getDate();
			/*if (oDate < 10)
				oDate = String("0" + oDate);
			else
				oDate = String(oDate);*/

			var oDate1 = oYear + oMonth + oDate;
			this.oSelectedDate1 = oStartDate;

			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
			var oModelMisc = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModelMisc, "viewDataMisc");
			this._getUser();
			/*this._getMisc();*/
			this._getData2(oStartDate);
			if (this.oLastSelectedJSDate && oStartDate.getTime() === this.oLastSelectedJSDate.getTime()) {
				oCalendar.removeSelectedDate(oSelectedDate);
				this.oLastSelectedJSDate = null;
			} else {
				this.oLastSelectedJSDate = oStartDate;
			}

			/*this._updateText(oCalendar);*/
			/*this._updateText(oStartDate);*/
		},
		_updateText: function (oCalendar) {
			var oText = this.byId("selectedDate"),
				aSelectedDates = oCalendar.getSelectedDates(),
				oDate;
			/*	var oMasterData = {
					"UserScreen": [{
						"RICEF": "ID1",
						"Task": "Task 1",
						"TaskMisc": "PTO",
						"Hours": "45",
						"Availability": "20",
						"Worked": "",
						"HoursBook": "",
						"Comment": ""
					}, {
						"RICEF": "ID2",
						"Task": "Task 2",
						"TaskMisc": "HOL",
						"Hours": "45",
						"Availability": "20",
						"Worked": "",
						"HoursBook": "",
						"Comment": ""
					}, {
						"RICEF": "ID3",
						"Task": "Task3",
						"TaskMisc": "SICK",
						"Hours": "45",
						"Availability": "20",
						"Worked": "",
						"HoursBook": "",
						"Comment": ""
					}, {
						"RICEF": "ID4",
						"Task": "Task4",
						"TaskMisc": "PRIV",
						"Hours": "45",
						"Availability": "20",
						"Worked": "",
						"HoursBook": "",
						"Comment": ""
					}],

					UserScreen1: [{
						"TaskMisc": "PTO",
						"HoursBook": "",
						"Comment": ""
					}, {
						"TaskMisc": "HOL",
						"HoursBook": "",
						"Comment": ""
					}, {
						"TaskMisc": "SICK",
						"HoursBook": "",
						"Comment": ""
					}, {
						"TaskMisc": "PRIV",
						"HoursBook": "",
						"Comment": ""
					}]
				};*/

			if (aSelectedDates.length > 0) {
				oDate = aSelectedDates[0].getStartDate();
				/*	var viewData = new sap.ui.model.json.JSONModel(oMasterData);
					this.getView().setModel(viewData, "viewData");
					this.getView().byId("idselmisc").setExpanded(true);
					this.getView().byId("idseltask").setExpanded(true);*/
				var oModel = new sap.ui.model.json.JSONModel(); //create a model
				this.getView().setModel(oModel, "viewData");
				this._getData2();
				oText.setText(this.oFormatYyyymmdd.format(oDate));
			} else {
				oText.setText("No Date Selected");
			}
		},
		/*	]: /sap/opu/odata/sap/ZDPMT_GW_INIT_STAT_UI_SRV/F4TaskidsSet?$filter=Projectid eq 'TEST2' and Processid eq '2' and Ricefid eq ''*/
		_getUser: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			/*	f.push(new sap.ui.model.Filter("TimesheetType", "EQ", "P"));*/
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 

			//BOC - Azhar

			// BusyIndicator.show(); //Starting Busy Indicator
			// this.getOwnerComponent().getModel("timeSheet").read("/F4TaskidsSet", {
			// 	filters: f, //read call to fetch table data
			// 	success: function (oData) {
			// 		BusyIndicator.hide(); //Hiding Busy Indicator
			// 		that.getView().getModel("viewData").setProperty("/UserSet", oData.results);
			// 		// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));

			// 	},
			// 	error: function (oError) {
			// 		BusyIndicator.hide(); //Hiding Busy Indicator
			// 		var responseText = JSON.parse(oError.responseText);
			// 		var msg = responseText.error.message.value;
			// 		MessageBox.error(msg); //Displaying Error Message in Dialog Box
			// 	}
			// });
			var entitySet = "F4TaskidsSet";
			models.readAndSetModel(that, entitySet, "TaskRicefModel", that.setModelBack, f);
			// EOC - Azhar
		},
		_getMisc: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			f.push(new sap.ui.model.Filter("TimesheetType", "EQ", "M"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 

			//BOC - Azhar

			// BusyIndicator.show(); //Starting Busy Indicator
			// this.getOwnerComponent().getModel("timeSheet").read("/F4TaskidsSet", {
			// 	filters: f, //read call to fetch table data
			// 	success: function (oData) {
			// 		BusyIndicator.hide(); //Hiding Busy Indicator
			// 		that.getView().getModel("viewData").setProperty("/UserSet", oData.results);
			// 		// f.push(new sap.ui.model.Filter("Username", "EQ", "SAKDOGRA"));

			// 	},
			// 	error: function (oError) {
			// 		BusyIndicator.hide(); //Hiding Busy Indicator
			// 		var responseText = JSON.parse(oError.responseText);
			// 		var msg = responseText.error.message.value;
			// 		MessageBox.error(msg); //Displaying Error Message in Dialog Box
			// 	}
			// });
			var entitySet = "F4TaskidsSet";
			models.readAndSetModel(that, entitySet, "TaskMiscModel", that.setModelBack, f);
			// EOC - Azhar
		},
		/*/sap/opu/odata/sap/ZDPMT_GW_INIT_STAT_UI_SRV/TimeSheetItemSet?$filter=Projectid eq 'TEST2'TEST11 and Userid eq 'SAKDOGRA'ABCD and Role eq 'MANAGER'XYZ and Processid eq '1' and Datefield eq "20191214"20191204 */

		_getData2: function (oDate1) {
			var that = this;
			var f = [];
			var modelData = this.getOwnerComponent().getModel("viewData").getData();
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Userid", "EQ", modelData.userName));
			// f.push(new sap.ui.model.Filter("Role", "EQ", "XYZ"));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			/*Datefield: "20191212"*/
			 f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));
			//var f = [];
			//f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
			//f.push(new sap.ui.model.Filter("Process", "EQ", "1"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 
			/*	BusyIndicator.show();*/ //Starting Busy Indicator

			// BOC - Azhar
			var entitySet = "TimeSheetItemSet";
			models.readAndSetModel(that, entitySet, "viewData", that.setModelBack, f);
			// EOC - Azhar
		},

		// BOC - Azhar
		setModelBack: function (data, modelName, entitySet) {
			var vController = this;
			var oView = vController.getView();
			if (entitySet === "TimeSheetItemSet") {

				// Put filter on data.results to categorize between normal tasks and Misc tasks based on Task-ID and then assign to the respective model below
				var UserScreenTypeP = [];
				var UserScreenTypeM = [];
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].TimesheetType === "P") {
						UserScreenTypeP.push(data.results[i]);
					} else {
						UserScreenTypeM.push(data.results[i]);
					}
				}
				oView.getModel("viewData").setProperty("/UserScreen", UserScreenTypeP);
				oView.getModel("viewDataMisc").setProperty("/UserScreenMisc", UserScreenTypeM);
			}
			if (entitySet === "F4TaskidsSet") {
				/*	var oTaskIdF4 = new sap.ui.model.json.JSONModel();
					oTaskIdF4.setData(data);
					this.getView().setModel(oTaskIdF4, modelName);
					this.getView().getModel(modelName).refresh();*/
				var oTaskIdF4 = new sap.ui.model.json.JSONModel();
				var TimesheetTypeP = [];
				var TimesheetTypeM = [];
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].TimesheetType === "P") {
						TimesheetTypeP.push(data.results[i]);
					} else {
						TimesheetTypeM.push(data.results[i]);
					}
				}
				data.TimesheetTypeP = TimesheetTypeP;
				data.TimesheetTypeM = TimesheetTypeM;
				oTaskIdF4.setData(data);
				this.getView().setModel(oTaskIdF4, modelName);
				this.getView().getModel(modelName).refresh();
			}
		},
		// EOC - Azhar
		onChangeRicefId: function (oEvent) {
			var oModel1 = this.getView().getModel("viewData");
			var dataRicef = oModel1.getProperty("/UserScreen");
			var indexRicef = oEvent.getSource().getSelectedItemId()[58];
			for (var i = indexRicef; i < dataRicef.length; i++) {
				var a = {};
				a.Ricefid = dataRicef[i].Ricefid;
				if (a.Ricefid === "") {
					var msg = "Mandatory Field";
					MessageBox.error(msg);
					break;
				}
			}

		},
		onChangeTask: function (oEvent) {
			// BOC - Azhar for validating duplicate Ricef and Task-Id's
			var context = oEvent.getSource().getBindingContext("viewData");
			var selectedTaskId = context.getProperty("Taskid");
			var selectedRicefId = context.getProperty("Ricefid");
			var modelData = context.getModel().getData().UserScreen;
			var vCount = 0;
			for (var i = 0; i < modelData.length; i++) {
				if (selectedRicefId === modelData[i].Ricefid && selectedTaskId === modelData[i].Taskid) {
					vCount++;
				}
				if (vCount > 1) {
					MessageBox.show(
						models.getI18nText("DuplicateRicefTaskError", this), {
							icon: MessageBox.Icon.ERROR,
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {}
						}
					);
					oEvent.getSource().setValueState("Error");
					this.valueFlag = 1;
				} else {
					oEvent.getSource().setValueState("None");
				}
			}
		},
		onChangeTaskMisc: function (oEvent) {
			// BOC - Azhar for validating duplicate Ricef and Task-Id's
			var context = oEvent.getSource().getBindingContext("viewDataMisc");
			var selectedTaskId = context.getProperty("Taskid");
			/*var selectedRicefId = context.getProperty("Ricefid");*/
			var modelData = context.getModel().getData().UserScreenMisc;
			var vCount = 0;
			for (var i = 0; i < modelData.length; i++) {
				if (selectedTaskId === modelData[i].Taskid) {
					vCount++;
				}
				if (vCount > 1) {
					MessageBox.show(
						models.getI18nText("DuplicateRicefTaskError", this), {
							icon: MessageBox.Icon.ERROR,
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {}
						}
					);
					oEvent.getSource().setValueState("Error");
					this.valueFlag = 1;
				} else {
					oEvent.getSource().setValueState("None");
				}
			}
		},

		// onChangeTaskMisc: function (oEvent) {
		// 	// BOC - Azhar for validating duplicate Ricef and Task-Id's
		// 	var context = oEvent.getSource().getBindingContext("viewDataMisc");
		// 	var selectedTaskId = context.getProperty("Taskid");
		// 	var selectedRicefId = context.getProperty("Ricefid");
		// 	var modelData = context.getModel().getData().UserScreen;
		// 	var vCount = 0;
		// 	for (var i = 0; i < modelData.length; i++) {
		// 		if (selectedRicefId === modelData[i].Ricefid && selectedTaskId === modelData[i].Taskid) {
		// 			vCount++;
		// 		}
		// 		if (vCount > 1) {
		// 			MessageBox.show(
		// 				models.getI18nText("DuplicateRicefTaskError", this), {
		// 					icon: MessageBox.Icon.ERROR,
		// 					actions: [MessageBox.Action.OK],
		// 					onClose: function (oAction) {}
		// 				}
		// 			);
		// 			oEvent.getSource().setValueState("Error");
		// 		} else {
		// 			oEvent.getSource().setValueState("None");
		// 		}
		// 	}
		// 	// EOC - Azhar for validating duplicate Ricef and Task-Id's

		// 	// var oModel1 = this.getView().getModel("viewData");
		// 	// var data1 = oModel1.getProperty("/UserScreen");
		// 	// var index = oEvent.getSource().getSelectedItemId()[58];
		// 	// for (var i = index; i < data1.length; i++) {
		// 	// 	var a = {};
		// 	// 	for (var j = 0; j < i; j++) {
		// 	// 		var b = {};
		// 	// 		a.Ricefid = data1[i].Ricefid + data1[i].Taskid;
		// 	// 		b.Ricefid = data1[j].Ricefid + data1[j].Taskid;
		// 	// 		if (a.Ricefid === b.Ricefid) {
		// 	// 			var msg = "same values";
		// 	// 			MessageBox.error(msg);
		// 	// 			break;
		// 	// 			//Displaying Error Message in Dialog Box
		// 	// 		}
		// 	// 	}
		// 	// 	break;
		// 	// }

		// },
		onChangeHours: function (oEvent) {
			// BOC - Azhar for Hours validation
			var vHoursAvail = oEvent.getSource().getValue();
			var context = oEvent.getSource().getBindingContext("viewData");
			var vHourAllocated = context.getProperty("HoursAllocated");
			if (vHoursAvail > vHourAllocated) {
				MessageToast.show(models.getI18nText("HoursError", this));
				oEvent.getSource().setValueState("Error");
				this.valueFlag = 1;
			} else {
				oEvent.getSource().setValueState("None");
			}
			// EOC - Azhar for Hours validation
		},
		onSubmit: function (oEvt) {
			var oModel = this.getView().getModel("viewData");
			var data = oModel.getProperty("/UserScreen");
			var oModelMisc = this.getView().getModel("viewDataMisc");
			var dataMisc = oModelMisc.getProperty("/UserScreenMisc");
			oModel.setProperty("/UserScreen1", []);
			var data1 = oModel.getProperty("/UserScreen1");
			for (var j = 0; j < data.length; j++) {
				data1.push(data[j]);
			}
			for (var j = 0; j < dataMisc.length; j++) {
				data1.push(dataMisc[j]);
			}

			/* 
			  "Projectid":"TEST1",
			  "Userid":"ABCD",
			  "Role":"XYZ",
			  "Processid":"1",
			  "NavTsHeadToItem":[
			    {
			      "Projectid":"TEST1",
			      "Userid":"ABCD",
			      "Role":"XYZ",
			      "TimesheetType":"M",
			      "Ricefid":"1",
			      "Taskid":"1",
			      "TaskDescription":"TEST Decription",
			      "HoursAllocated":1,
			      "HoursAvailblty":1,
			      "HoursBooked":1,
			      "Datefield":"20191204",
			      "TaskvalStDate":"20191204",
			      "TaskvalEnDate":"20191204",
			      "Comments":"Comments"
			    },
				    {
			      "Projectid":"TEST1",
			      "Userid":"XYZ",
			      "Role":"ABC",
			      "TimesheetType":"M",
			      "Ricefid":"2",
			      "Taskid":"1",
			      "TaskDescription":"3",
			      "HoursAllocated":3,
			      "HoursAvailblty":3,
			      "HoursBooked":3,
			      "Datefield":"20191204",
			      "TaskvalStDate":"20191204",
			      "TaskvalEnDate":"20191204",
			      "Comments":"Comments"
			    }
			  ]


			*/
			var body = {
				Projectid: data1[0].Projectid,
				Userid: data1[0].Userid,
				Role: data1[0].Role,
				Processid: data1[0].Processid,
				NavTsHeadToItem: []

			};

			// combine both the normal tasks and misc tasks and send it in a single entityset

			for (var i = 0; i < data.length; i++) {
				var a = {};
				/*	var dataTime = data[i].TaskvalStDate;
					var x = [], y = [], z = [];
					 x[0] = dataTime.getFullYear();
					x[1] = 	dataTime.getMonth()+1;
					x[2] = dataTime.getDate();
					var oLiteral = x[0] + "-" +  x[1] + "-" + x[2] +"T00:00:00";
						var dataTime1 = data[i].Datefield;
					y[0] = dataTime1.getFullYear();
					y[1] = 	dataTime1.getMonth();
					y[2] = dataTime1.getDate();
					var oLiteral1 = y[0] + "-" +  y[1] + "-" + y[2] +"T00:00:00";
						var dataTime2 = data[i].TaskvalEnDate;
					z[0] = dataTime2.getFullYear();
					z[1] = 	dataTime2.getMonth()+1;
					z[2] = dataTime2.getDate();
						var oLiteral2 = z[0] + "-" +  z[1] + "-" + z[2] +"T00:00:00";*/

				a.Projectid = data1[i].Projectid;
				a.Userid = data1[i].Userid;
				a.Role = data1[i].Role;
				a.Processid = data1[i].Processid;
				a.TimesheetType = data1[i].TimesheetType;
				a.Ricefid = data1[i].Ricefid;
				a.Taskid = data1[i].Taskid;
				a.TaskDescription = data1[i].TaskDescription;
				a.HoursAllocated = Number(data1[i].HoursAllocated);
				a.HoursAvailblty = Number(data1[i].HoursAvailblty);
				a.HoursBooked = Number(data1[i].HoursBooked);
				a.Datefield = data1[i].Datefield;
				a.TaskvalStDate = data1[i].Datefield;
				a.TaskvalEnDate = data1[i].Datefield;
				a.Comments = data1[i].Comments;
				body.NavTsHeadToItem.push(a);
			}

			/*	for (var i = 0; i < dataMisc.length; i++) {
				var a = {};
				/*	var dataTime = data[i].TaskvalStDate;
					var x = [], y = [], z = [];
					 x[0] = dataTime.getFullYear();
					x[1] = 	dataTime.getMonth()+1;
					x[2] = dataTime.getDate();
					var oLiteral = x[0] + "-" +  x[1] + "-" + x[2] +"T00:00:00";
						var dataTime1 = data[i].Datefield;
					y[0] = dataTime1.getFullYear();
					y[1] = 	dataTime1.getMonth();
					y[2] = dataTime1.getDate();
					var oLiteral1 = y[0] + "-" +  y[1] + "-" + y[2] +"T00:00:00";
						var dataTime2 = data[i].TaskvalEnDate;
					z[0] = dataTime2.getFullYear();
					z[1] = 	dataTime2.getMonth()+1;
					z[2] = dataTime2.getDate();
						var oLiteral2 = z[0] + "-" +  z[1] + "-" + z[2] +"T00:00:00";*/

			/*	a.Projectid = dataMisc[i].Projectid;
				a.Userid = dataMisc[i].Userid;
				a.Role = dataMisc[i].Role;
				a.Processid = dataMisc[i].Processid;
				a.TimesheetType = dataMisc[i].TimesheetType;
				a.Ricefid = dataMisc[i].Ricefid;
				a.Taskid = dataMisc[i].Taskid;
				a.TaskDescription = dataMisc[i].TaskDescription;
				a.HoursAllocated = Number(dataMisc[i].HoursAllocated);
				a.HoursAvailblty = Number(dataMisc[i].HoursAvailblty);
				a.HoursBooked = Number(dataMisc[i].HoursBooked);
				a.Datefield = dataMisc[i].Datefield;
				a.TaskvalStDate = dataMisc[i].Datefield;
				a.TaskvalEnDate = dataMisc[i].Datefield;
				a.Comments = dataMisc[i].Comments;
				body.NavTsHeadToItem.push(a);
			}*/

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
			if (this.valueFlag === 1) {
				MessageBox.show(
					models.getI18nText("Cannot save with errors", this), {
						icon: MessageBox.Icon.ERROR,
						actions: [MessageBox.Action.OK],
						onClose: function (oAction) {}
					}
				);
			} else {
				this.getOwnerComponent().getModel("timeSheet").create("/TimeSheetHeaderSet", body, {
					success: function (oData, response) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var msg = "Update Successful";
						MessageBox.success(msg);

					}.bind(this),
					error: function (oError) {
						BusyIndicator.hide(); //Hiding Busy Indicator
						var responseText = JSON.parse(oError.responseText);
						var msg = responseText.error.message.value;
						MessageBox.error(msg); //Displaying Error Message in Dialog Box
					}
				});
			}
		},
		/*	addTaskClick: function (oEvt) {
				if (!this._addTaskPop) {
					this._addTaskPop = sap.ui.xmlfragment("myFragaddTaskPop",
						"ZDPMT_TimeSheet.TimeSheet.Fragments.addTask", this);
					this.getView().addDependent(this._addTaskPop);
				}
				this._addTaskPop.openBy(oEvt.getSource());
			},
			addMiscClick: function (oEvt) {
				if (!this._addMiscPop) {
					this._addMiscPop = sap.ui.xmlfragment("myFragaddMiscPop",
						"ZDPMT_TimeSheet.TimeSheet.Fragments.addMisc", this);
					this.getView().addDependent(this._addMiscPop);
				}
				this._addMiscPop.openBy(oEvt.getSource());
			},*/
		addTaskClick: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("viewAdd");
		},
		addMiscClick: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("viewAdd");
		},
		onView: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("viewTask");
		},
		onAddRow: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewData");
			var HeaderModelData = HeaderModel.getProperty("/UserScreen") || [];
			var modelData = this.getOwnerComponent().getModel("viewData").getData();
			var newEntry = {
				Projectid: this.projectId,
				Userid: modelData.userName,
				//Role: "XYZ",
				Processid: "1",
				TimesheetType: "P",
				Ricefid: "",
				Taskid: "",
				TaskDescription: "",
				HoursAllocated: 0,
				HoursAvailblty: 0,
				HoursBooked: 0,
				Datefield: new Date(this.oSelectedDate1),
				TaskvalStDate: new Date(this.oSelectedDate1),
				TaskvalEnDate: new Date(this.oSelectedDate1),
				Comments: "",
				Editable: true
			};
			/*	newEntry = HeaderModelData.pop([1]);
				HeaderModelData.push(newEntry);*/
			HeaderModelData.push(newEntry);
			HeaderModel.refresh();
		},
		onAddRowMisc: function () {
			var HeaderModelMisc = this.getView().getModel("viewDataMisc");
			var HeaderModelDataMisc = HeaderModelMisc.getProperty("/UserScreenMisc") || [];
			var modelData = this.getOwnerComponent().getModel("viewData").getData();
			var newEntry = {
				Projectid: this.projectId,
				Userid: modelData.userName,
			//	Role: "XYZ",
				Processid: "1",
				TimesheetType: "M",
				Taskid: "",
				TaskDescription: "",
				HoursBooked: 0,
				Datefield: new Date(this.oSelectedDate1),
				TaskvalStDate: new Date(this.oSelectedDate1),
				TaskvalEnDate: new Date(this.oSelectedDate1),
				Comments: "",
				Editable: true
			};
			HeaderModelDataMisc.push(newEntry);
			HeaderModelMisc.refresh();
			/*	var HeaderModel = this.getView().getModel("viewData");
				var HeaderModelData = HeaderModel.getData().UserScreen1;
				HeaderModelData.splice(0, 0, {
					"TaskMisc": "",
					"HoursBook": "",
					"Comment": "",
					Editable: true
				});
				HeaderModel.refresh();*/
		},
		onDeleteRow: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewData");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var index = contextPath.split("/UserScreen/")[1];
			this.getView().getModel("viewData").getData().UserScreen.splice(index, 1);
			HeaderModel.refresh();
		},
		onDeleteRowMisc: function (oEvent) {
			var HeaderModel = this.getView().getModel("viewDataMisc");
			var contextPath = oEvent.getSource().getParent().getBindingContextPath();
			var index = contextPath.split("/UserScreenMisc/")[1];
			this.getView().getModel("viewDataMisc").getData().UserScreenMisc.splice(index, 1);
			HeaderModel.refresh();
		},

		onNavBack: function (oEvent) {
			/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("TargetMainAdmin");*/
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("TargetMainAdmin", true);
			}
		}

	});
});