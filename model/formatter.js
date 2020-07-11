sap.ui.define([], function () {
	"use strict";
	var formatter = {
		setVisibility: function (Fieldname) {
			if (Fieldname !== '' && Fieldname !== undefined && Fieldname !== null) {
				return false;
			} else {
				return true;
			}
		},

		getVisibilityText: function (data) {
			var oData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavF4SearchhelpSet/results");
			if (oData !== undefined && data !== null && data !== "") {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].FieldName === "VISIBILITY" && oData[i].DomvalueL === data) {
						return oData[i].DdText;
						break;
					}
				}
			}
		},

		getFieldTypeText: function (data) {
			var oData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavF4SearchhelpSet/results");
			if (data !== undefined && data !== null && data !== "") {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].FieldName === "TYPE" && oData[i].DomvalueL === data) {
						return oData[i].DdText;
						break;
					}
				}
			}
		},

		getkeyValue: function (data) {
			var oData = this.getView().getModel("viewData").getProperty("/PocessesTable/NavF4SearchhelpSet/results");
			if (oData !== undefined && data !== null && data !== "") {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].FieldName === "KEY_FLAG" && oData[i].DomvalueL === data) {
						return oData[i].DdText;
						break;
					}
				}
			}
		},
	};
	return formatter;
});