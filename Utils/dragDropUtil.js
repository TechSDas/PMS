sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";

	var Utils = {

		ranking: {
			Initial: 0,
			Default: 1024,
			Before: function (iRank) {
				return iRank + 1024;
			},
			Between: function (iRank1, iRank2) {
				// limited to 53 rows
				return (iRank1 + iRank2) / 2;
			},
			After: function (iRank) {
				return iRank / 2;
			}
		},

		getAvailableProductsTable: function (oController) {
			return oController.getOwnerComponent().getRootControl().byId("availableProducts").byId("table");
		},

		getSelectedProductsTable: function (oController) {
			return oController.byId("table");
		},

		getSelectedItemContext1: function (oTable, fnCallback) {
			var aSelectedItems = oTable.getSelectedItems();
			var oSelectedItem = aSelectedItems[0];

			if (!oSelectedItem) {
				MessageBox.error("Please select a row!");
				return;
			}

			var oSelectedContext = oSelectedItem.getBindingContext("viewData1");
			if (oSelectedContext && fnCallback) {
				var iSelectedIndex = oTable.indexOfItem(oSelectedItem);
				fnCallback(oSelectedContext, iSelectedIndex, oTable);
			}

			return oSelectedContext;
		},

		getSelectedItemContext: function (oTable, fnCallback) {
			var aSelectedItems = oTable.getSelectedItems();
			var oSelectedItem = aSelectedItems[0];

			if (!oSelectedItem) {
				MessageBox.error("Please select a row!");
				return;
			}

			var oSelectedContext = oSelectedItem.getBindingContext("viewData");
			if (oSelectedContext && fnCallback) {
				var iSelectedIndex = oTable.indexOfItem(oSelectedItem);
				fnCallback(oSelectedContext, iSelectedIndex, oTable);
			}

			return oSelectedContext;
		}

	};

	return Utils;

}, /* bExport= */ true);