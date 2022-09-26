// 格式化时间
function formateDate(datetime, type) {
	var year = datetime.getFullYear(),
		month = ("0" + (datetime.getMonth() + 1)).slice(-2),
		date = ("0" + datetime.getDate()).slice(-2),
		hour = ("0" + datetime.getHours()).slice(-2),
		minute = ("0" + datetime.getMinutes()).slice(-2),
		second = ("0" + datetime.getSeconds()).slice(-2);
	if (type === "Y-M-D h:min:s") {
		var result = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
	} else if (type === "Y-M-D h:min") {
		var result = year + "-" + month + "-" + date + " " + hour + ":" + minute;
	} else if (type === "Y-M-D") {
		var result = year + "-" + month + "-" + date;
	} else if (type === "h:min:s") {
		var result = hour + ":" + minute + ":" + second;
	} else if (type === "h:min") {
		var result = hour + ":" + minute;
	}
	return result;
}

module.exports = {
	formateDate
}