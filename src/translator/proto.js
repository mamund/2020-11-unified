// ****************************************************
// to proto file
// passes https://protogen.marcgravell.com/ validator
// ****************************************************

const { metadata_title, semantic, groups, safe, unsafe, idempotent } = require('../util/alps-predicates')
const { rxHash, rxQ } = require('../util/print-utils')

module.exports = (doc, options) => {
  var rtn = "";
  var obj;
  var coll;

  // preamble
  rtn += 'syntax = "proto3";\n';
  rtn += `package ${doc.alps.ext && doc.alps.ext.filter(metadata_title)[0].value.replace(/ /g,'_')||"ALPS_API"};\n`;
  rtn += '\n';

  // signature
  rtn += '// *******************************************************************\n';
  rtn += `// generated by "unified" from ${options.file}\n`;
  rtn += `// date: ${new Date()}`;
  rtn += '\n';
  rtn += '// http://github.com/mamund/2020-11-unified\n';
  rtn += '// *******************************************************************\n';
  rtn += '\n';
  
  // params
  coll = doc.alps.descriptor.filter(semantic);
  coll.forEach(function(msg) {
    rtn += `message ${msg.id}Params {\n`;
    var c = 0;
    c++;
    rtn += `  string ${msg.id} = ${c};\n`;    
    rtn += '}\n';
  });
  rtn += '\n';

  // objects
  coll = doc.alps.descriptor.filter(groups);
  coll.forEach(function(msg) {
    rtn += `message ${msg.id} {\n`;
    var c = 0;
    msg.descriptor.forEach(function(prop) {
      c++;
      rtn += `  string ${prop.href} = ${c};\n`;    
    });
    rtn += '}\n';
    rtn += `message ${msg.id}Response {\n`;
    rtn += `  repeated ${msg.id} ${msg.id}Collection = 1;\n`
    rtn += '}\n';
    rtn += `message ${msg.id}Empty {}\n`;
  });
  rtn += '\n';

  // procedures
  rtn += `service ${doc.alps.ext && doc.alps.ext.filter(metadata_title)[0].value.replace(/ /g,'_')||"ALPS_API"}_Service {\n`;
  
  coll = doc.alps.descriptor.filter(safe);
  coll.forEach(function(item) {
    rtn += `  rpc ${item.id}(`
    if(item.descriptor) {
      rtn += item.descriptor[0].href;      
    }
    else {
      rtn += `${item.rt}Empty`;
    }
    rtn += `) returns (${item.rt}Response) {};\n`;  
  });
  
  coll = doc.alps.descriptor.filter(unsafe);
  coll.forEach(function(item) {
    rtn += `  rpc ${item.id}(`
    if(item.descriptor) {
      rtn += item.descriptor[0].href;      
    }
    rtn += `) returns (${item.rt}Response) {};\n`;  
  });

  coll = doc.alps.descriptor.filter(idempotent);
  coll.forEach(function(item) {
    rtn += `  rpc ${item.id}(`
    if(item.descriptor) {
      rtn += item.descriptor[0].href;
      if(item.descriptor[0].href === "#id") {
        rtn += "Params";
      }      
    }
    rtn += `) returns (${item.rt}Response) {};\n`;  
  });
  
  rtn += '}\n';
 
  // clean up 
  rtn = rtn.replace(rxHash,"");
  rtn = rtn.replace(rxQ,"#");
   
  return rtn;
}