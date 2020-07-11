function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZDPMT_GW_PMT_PROC_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}