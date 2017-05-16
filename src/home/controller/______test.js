'use strict';
function outPut(type,test,fail,scoreType,sql,count){
    console.log("");
    console.log("查询类别： "+type);
    console.log("查询方式:  "+scoreType);
    console.log("生源地：   "+test.pos);
    console.log("查询年限:  "+test.year);
    console.log("考生分数:  "+test.score);
    console.log("省控线：   "+test.pos_line);
    console.log("浮动区间:  "+test.range);
    console.log("查询区间:  "+(test.score_real-parseInt(test.range))+" -- "+(test.score_real+parseInt(test.range)));
    console.log("");
    console.log("查询条件:  "+sql);
    console.log("");
    console.log("返回条数:  "+count);
    console.log("测试失败:  "+fail);
    console.log("");
    console.log("--------- 测试结果显示完毕----------");
}
export default function(type,test,major,result,scoreType,sql){
    console.log("");
    console.log("-------------测试结果--------------");
    var i=0,fail=0,flag=0;
    var msg;
    for(i=0;i<result.count;i++){
        flag=0;
	msg="";
	if(type=="按专业查询"){
	    if(result.data[i].major_name!=major){
	        msg="返回专业名错误  -->  "+result.data[i].Mname;
	        flag=1;
	    }
	}
	if(scoreType=="Mcutoffline_dif"){
	    if(result.data[i].minScore<(test.score_real-parseInt(test.range))){
	        msg="返回分数过低错误  -->  "+result.data[i].Mcutoffline;
		flag=1;
	    }
	    if(result.data[i].minScore>(test.score_real+parseInt(test.range))){
	        msg="返回分数过高错误  -->  "+result.data[i].Mcutoffline;
		flag=1;
	    }
	}
	if(scoreType=="Maverage_dif"){
	    if(result.data[i].avgScore<(test.score_real-parseInt(test.range))){
	        msg="返回分数过低错误  -->  "+result.data[i].Maverage_dif;
		flag=1;
	    }
	    if(result.data[i].avgScore>(test.score_real+parseInt(test.range))){
		msg="返回分数过高错误  -->  "+result.data[i].Maverage_dif;
		flag=1;
	    }
	}
	if(scoreType=="Mhighest_dif"){
	    if(result.data[i].maxScore<(test.score_real-parseInt(test.range))){
	        msg="返回分数过低错误  -->  "+result.data[i].Mhighest_dif;
		flag=1;
	    }
	    if(result.data[i].maxScore>(test.score_real+parseInt(test.range))){
		msg="返回分数过高错误  -->  "+result.data[i].Mhighest_dif;
		flag=1;
	    }
	}
	if(scoreType=="Ccutoffline_dif"){
	    if(result.data[i].minScore<(test.score_real-parseInt(test.range))){
	        msg="返回分数过低错误  -->  "+result.data[i].Ccutoffline_dif;
		flag=1;
	    }
	    if(result.data[i].minScore>(test.score_real+parseInt(test.range))){
		msg="返回分数过高错误  -->  "+result.data[i].Ccutoffline_dif;
		flag=1;
	    }
	}
	if(scoreType=="Caverage_dif"){
	    if(result.data[i].avgScore<(test.score_real-parseInt(test.range))){
	        msg="返回分数过低错误  -->  "+result.data[i].Caverage_dif;
		flag=1;
	    }
	    if(result.data[i].avgScore>(test.score_real+parseInt(test.range))){
		msg="返回分数过高错误  -->  "+result.data[i].Caverage_dif;
		flag=1;
	    }
	}
	if(result.data[i].batch==null){
	    msg="返回批次错误 -->  没有批次";
	    flag=1;
	}
	if(result.data[i].school_name==null){
	    msg="返回学校名称错误  -->  没有学校名";
	    flag=1;
	}
	if(result.data[i].position==null){
	    msg="返回学校地区错误  -->  没有地区";
	    flag=1;
	}
	if(result.data[i].site==null){
	    msg="返回学校网址错误  -->  没有网址";
	    flag=1;
	}
	if(flag==1){
	    console.error(msg);
	    console.log(result.data[i]);
	    fail++;
	}
    }
    outPut(type,test,fail,scoreType,sql,result.count);
}
