'use strict';

import Base from './base.js';
import Test from './test.js';

export default class extends Base {
  init(http){
    super.init(http);
  }
  async indexAction() {
//由于数据库支持，暂时没有用到省份和年份
    let searchType = this.http.query.type;
    this.assign('searchType', searchType);
    let type=this.get('type');
    let pos=this.get('pos');
    let year=this.get('year');
    let subject=this.get('subject');
    let scoreType=this.get('scoreType');
    let score=this.get('score');
    let range=this.get('range');
    let major=this.get('major');
    let page=this.get('page')||1;
    let pos_line=540;//省控线
    let score_real=parseInt(score)-pos_line;//考生分数与控制线的线差
    this.assign({
      'query': {
        year: year,
        pos: pos,
        subject: subject,
        score: score,
        range: range,
        major: major
      }
    });
    //数组存取专业
    let majors={'1':"计算机科学与技术",
		'2':"通信工程",
		'3':"机械设计制造及其自动化",
		'4':"土木工程",
		'5':"电气工程及其自动化",
		'6':"会计学",
		'7':"中医",
		'8':"临床医学",
		'9':"自动化",
		'10':"工商管理"
    };
    let pros={'1':'四川省'};
    let subjects={'1':'理科'};

    let method_major={  '1':'Mcutoffline_dif',
			'2':'Maverage_dif',
			'3':'Mhighest_dif'
    };
    let method_school={'1':'Ccutoffline_dif',
		'2':'Caverage_dif'
    };

    //数组存储用于传参给测试函数
    let test={  'pos':pros[pos],
		'year':year,
		'subject':subjects[subject],
		'score':score,
		'pos_line':pos_line,
		'range':range,
		'score_real':score_real,
		'year':year
    };
    if(type=='major'){//专业查询的方式
	//用数组来保存搜索方式，后面直接用scoreType作下标调用就行了
	let model=this.model('major');//调用model
	//组织查询条件
	var sql=method_major[scoreType]+" > '"+(score_real-parseInt(range))+"' and ";
	sql=sql+method_major[scoreType]+" <= '"+(score_real+parseInt(range))+"' and "
	sql=sql+"Mstatus = '1' and Myear = '"+year+"' and major.origin = '"+pros[pos]+"' and ";
	sql=sql+"Mname like '%"+majors[major]+"%'"+" and major.category = '"+subjects[subject]+"'";
	//对返回数据更名
	var field="major.Cname AS school_name,college.address AS position,Mname AS major_name,";
	field=field+"major.batch,Mcutoffline_dif AS minScore,college.website AS site";
	field=field+",Maverage_dif AS avgScore,Mhighest_dif AS maxScore";
	//进行组合查询
	var join="college ON major.Cname like college.Cname and college.Cyear='"+year+"'";
	let Major=await model.field(field).where(sql).join(join).order(method_major[scoreType]+" ASC").page(page).countSelect();
	this.assign({//返回查询结果及总页数
	    'Major':Major.data,
	    'pages':Major.totalPages
	});
  console.log(Major);
	//major_test，单元测试,用以测试前端传参之后后台是否能返回正确结果，验证代码可靠性
	//和正式执行的sql一样，只是调整成一次返回全部结果进行验证

	let Major_test=await model.field(field).where(sql).join(join).order(method_major[scoreType]+" ASC").page(1,1000).countSelect();

	Test("按专业查询",test,majors[major],Major_test,method_major[scoreType],sql);


    }
    else if(type=='school'){//查询学校的方式
	let model=this.model('college');//调用model
	//组织查询条件
	var sql=method_school[scoreType]+" > '"+(score_real-parseInt(range))+"' and ";
	sql=sql+method_school[scoreType]+" <= '"+(score_real+parseInt(range))+"' and Cstatus";
	sql=sql+" = '1' and Cyear = '"+year+"' and origin = '"+pros[pos]+"'";
	sql=sql+" and category = '"+subjects[subject]+"'";
	//结果更名
	var field="Cname AS school_name,address AS position,batch,Ccutoffline_dif AS";
	field=field+" minScore,Caverage_dif AS avgScore,website AS site";
	let School=await model.field(field).where(sql).order(method_school[scoreType]+" ASC").page(page).countSelect();//进行查询
	this.assign({//返回查询结果及总页数
		'School':School.data,
		'pages':School.tatalPages
	   });
  console.log(School);

	//测试
	let School_test=await model.field(field).where(sql).order(method_school[scoreType]+" ASC").page(1,1000).countSelect();//进行查询
	Test("按学校查询",test,"",School_test,method_school[scoreType],sql);

    }
    else{//判错--错误查询方式
	console.log("'"+type+"' type not found ！！！");
    }
    return this.display();
  }
}
