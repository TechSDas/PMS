sap.ui.define([
	"fi/pms/solution/ZFI_PMS_SOL/model/models",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function (models, Controller, JSONModel, BusyIndicator, MessageBox, History, MessageToast) {
	"use strict";

	return Controller.extend("fi.pms.solution.ZFI_PMS_SOL.controller.viewAdd", {
		sDate: "",
		eDate: "",
		sDateMisc: "",
		eDateMisc: "",
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
			var oModel = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel, "viewData");
			var oModel2 = new sap.ui.model.json.JSONModel(); //create a model
			this.getView().setModel(oModel2, "viewDataMisc");
			this._getData2();
			this._getUser();
			this._getData3();
			/*this._getMisc();*/
			this.sdate = this.byId("sDate").setMinDate(new Date());
			this.eDate = this.byId("eDate").setMinDate(new Date());
			this.sDateMisc = this.byId("sDateMisc").setMinDate(new Date());
			this.eDateMisc = this.byId("eDateMisc").setMinDate(new Date());
			// var sPath = jQuery.sap.getModulePath("ZDPMT_TimeSheet.TimeSheet", "/model/mockdata.json");
			// var oModel = new JSONModel(sPath);
			// this.getView().setModel(oModel);

		},
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("TargetMainAdmin", true);
			}
			/*	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("viewTile");*/
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
				Datefield: new Date(),
				TaskvalStDate: new Date(),
				TaskvalEnDate: new Date(),
				Comments: "",
				Editable: true
			};
			/*	newEntry = HeaderModelData.pop([1]);
				HeaderModelData.push(newEntry);*/
			HeaderModelData.push(newEntry);
			HeaderModel.refresh();
			// HeaderModelData.splice(0, 0, {

			// });
			// HeaderModel.refresh();
		},
		onAddRowMisc: function (oEvent) {
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
				Datefield: new Date(),
				TaskvalStDate: new Date(),
				TaskvalEnDate: new Date(),
				Comments: "",
				Editable: true
			};
			HeaderModelDataMisc.push(newEntry);
			HeaderModelMisc.refresh();
		},
		/*	onChangeTask: function (oEvent) {
				var oModel1 = this.getView().getModel("viewData");
				var data1 = oModel1.getProperty("/UserScreen");
				var index = oEvent.getSource().getSelectedItemId()[60];
				for (var i = index; i < data1.length; i++) {
					var a = {};
					for (var j = 0; j < i; j++) {
						var b = {};
						a.Ricefid = data1[i].Ricefid + data1[i].Taskid;
						b.Ricefid = data1[j].Ricefid + data1[j].Taskid;
						if (a.Ricefid === b.Ricefid) {
							var msg = "same values";
							MessageBox.error(msg);
							break;
							//Displaying Error Message in Dialog Box
						}
					}
					break;
				}
			},*/
		_getUser: function () {
			var that = this;
			var f = [];
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
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
		_getData3: function () {
			var that = this;
			var f = [];
			//	f.push(new sap.ui.model.Filter("Projectid", "EQ", "TEST1"));
			/*f.push(new sap.ui.model.Filter("UserName", "EQ", "SAKDOGRA"));*/
			/*f.push(new sap.ui.model.Filter("Ricefid", "EQ", "DEV123"));*/
			//	f.push(new sap.ui.model.Filter("Processid", "EQ", "1"));
			/*Datefield: "20191212"*/
			/*	f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));*/

			// BOC - Azhar
			var entitySet = "F4SystemUsersSet";
			models.readAndSetModel(that, entitySet, "userIdModel", that.setModelBack, f);
			// EOC - Azhar

		},
		setModelBack: function (data, modelName, entitySet) {
			var vController = this;
			var oView = vController.getView();
			/*	if (entitySet === "TimeSheetItemSet") {
					oView.getModel("viewData").setProperty("/UserScreen", data.results);
				}*/
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
			if (entitySet === "F4SystemUsersSet") {
				var oTaskIdF4Sys = new sap.ui.model.json.JSONModel();
				oTaskIdF4Sys.setData(data);
				this.getView().setModel(oTaskIdF4Sys, modelName);
				this.getView().getModel(modelName).refresh();
			}

		},
		_getData2: function () {
			var that = this;
			var f = [];
			var modelData = this.getOwnerComponent().getModel("viewData").getData();
			f.push(new sap.ui.model.Filter("Projectid", "EQ", this.projectId));
			f.push(new sap.ui.model.Filter("Userid", "EQ", modelData.userName));
			//f.push(new sap.ui.model.Filter("Role", "EQ", "XYZ"));
			f.push(new sap.ui.model.Filter("Processid", "EQ", "2"));
			/*Datefield: "20191212"*/
			 f.push(new sap.ui.model.Filter("Datefield", "EQ", oDate1));
			//var f = [];
			//f.push(new sap.ui.model.Filter("Projid", "EQ", "100"));
			//f.push(new sap.ui.model.Filter("Process", "EQ", "1"));
			//	var oModel = new sap.ui.model.json.JSONModel(); //create a model
			//	this.getView().setModel(oModel, "viewData"); //setting the model 
			BusyIndicator.show(); //Starting Busy Indicator
			this.getOwnerComponent().getModel("timeSheet").read("/TimeSheetItemSet", {
				filters: f, //read call to fetch table data
				success: function (oData) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					// that.getView().getModel("viewData").setProperty("/UserScreen", oData.results);
					var UserScreenTypeP = [];
					var UserScreenTypeM = [];
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].TimesheetType === "P") {
							UserScreenTypeP.push(oData.results[i]);
						} else {
							UserScreenTypeM.push(oData.results[i]);
						}
					}
					that.getView().getModel("viewData").setProperty("/UserScreen", UserScreenTypeP);
					that.getView().getModel("viewDataMisc").setProperty("/UserScreenMisc", UserScreenTypeM);

				},
				error: function (oError) {
					BusyIndicator.hide(); //Hiding Busy Indicator
					var responseText = JSON.parse(oError.responseText);
					var msg = responseText.error.message.value;
					MessageBox.error(msg); //Displaying Error Message in Dialog Box
				}
			});
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
				Projectid: data[0].Projectid,
				Userid: data[0].Userid,
				Role: data[0].Role,
				Processid: data[0].Processid,
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
						var msg = "Updated Successful";
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
		onChangeRicefId: function (oEvent) {
			var oModel1 = this.getView().getModel("viewData");
			var dataRicef = oModel1.getProperty("/UserScreen");
			var indexRicef = oEvent.getSource().getSelectedItemId()[58];
			for (var i = indexRicef; i < dataRicef.length; i++) {
				var a = {};
				a.Ricefid = dataRicef[i].Ricefid;
				if (a.Ricefid === "") {
					var msg = "mandatory field";
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
			// EOC - Azhar for validating duplicate Ricef and Task-Id's

			// var oModel1 = this.getView().getModel("viewData");
			// var data1 = oModel1.getProperty("/UserScreen");
			// var index = oEvent.getSource().getSelectedItemId()[58];
			// for (var i = index; i < data1.length; i++) {
			// 	var a = {};
			// 	for (var j = 0; j < i; j++) {
			// 		var b = {};
			// 		a.Ricefid = data1[i].Ricefid + data1[i].Taskid;
			// 		b.Ricefid = data1[j].Ricefid + data1[j].Taskid;
			// 		if (a.Ricefid === b.Ricefid) {
			// 			var msg = "same values";
			// 			MessageBox.error(msg);
			// 			break;
			// 			//Displaying Error Message in Dialog Box
			// 		}
			// 	}
			// 	break;
			// }

		},

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

			// DELETE BELOW COMMENTED CODE
			// var oModel1 = this.getView().getModel("viewData");
			// var data1 = oModel1.getProperty("/UserScreen");
			// var index = oEvent.getParameters().id;
			// index = index.slice(49);
			// for (var i = index; i < data1.length; i++) {
			// 	var a = {};
			// 	a.HoursAvailblty = data1[i].HoursAvailblty;
			// 	a.HoursAllocated = data1[i].HoursAllocated;
			// 	if(a.HoursAvailable > a.HoursAllocated){
			// 		var msg = "INvalid entry ";
			// 			MessageBox.error(msg);
			// 	}

			// }
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
		}

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
		/*	onChangeHours: function (oEvent) {
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
			},*/
	});
});