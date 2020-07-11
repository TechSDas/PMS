function initModel() {
	var a = "/sap/opu/odata/sap/ZDPMT_GW_PMT_PROC_SRV/";
	var e = new sap.ui.model.odata.ODataModel(a, true);
	sap.ui.getCore().setModel(e)
}