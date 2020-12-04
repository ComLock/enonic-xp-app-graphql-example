import { execute } from '/lib/graphql';
import { getSchema } from '/lib/lop/schema';
import { toStr } from '/lib/enonic/util'

//import { connect } from '/lib/xp/node';


const NAME       = 'graphql';
const TYPE       = 'service';
const LOG_PREFIX = `${NAME} ${TYPE}`;
//let global = {};


export function post(request) {
    //log.debug(`${LOG_PREFIX} request:${toStr(request)}`);

    const rBody = JSON.parse(request.body);
    //log.debug(`${LOG_PREFIX} request.body:${toStr(rBody)}`);

    return {
        body: execute(getSchema(), rBody.query, rBody.variables),
        contentType: 'application/json',
    };

} // function post
