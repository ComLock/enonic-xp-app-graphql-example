import { NODE_OBJECT_TYPE } from './node';
import { runAsSu } from '../context';
import { toStr } from '/lib/enonic/util';
import { forceArray } from '/lib/enonic/util/data';
import {
    createInputObjectType,
    createObjectType,
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLInt,
    GraphQLString,
    list,
    nonNull
} from '/lib/graphql';
import {
    connect,
    multiRepoConnect
} from '/lib/xp/node';


const NAME       = 'schema/multiRepoConnection';
const TYPE       = 'lib';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export const MULTI_REPO_QUERY_SOURCES_INPUT_TYPE = createInputObjectType({
    name: 'Sources',
    fields: {
        repoId: { type: nonNull(GraphQLString) },
        branch: {
            type: GraphQLString,
            default: 'master',
            defaultValue: 'master',
        },
        principals: { type: list(GraphQLString) } //['role:system.admin']
    }
}); // MULTI_REPO_QUERY_SOURCES_INPUT_TYPE


export const MULTI_REPO_QUERY_HIT_OBJECT_TYPE = createObjectType({
    name: 'MultiRepoQueryHit',
    description: 'MultiRepoQueryHit description',
    fields: {
        id:     { type: nonNull(GraphQLString) },
        score:  { type: nonNull(GraphQLFloat ) },
        repoId: { type: nonNull(GraphQLString) },
        branch: { type: nonNull(GraphQLString) },
        node: {
            type: NODE_OBJECT_TYPE,
            resolve: env => runAsSu(() => {
                const node = connect({
                    repoId: env.source.repoId,
                    branch: env.source.branch
                }).get(env.source.id);
                //log.debug(`${LOG_PREFIX} node:${toStr(node)}`);
                return node;
            }) // resolve
        } // node
    } // fields
}); // MULTI_REPO_QUERY_HIT_OBJECT_TYPE


export const MULTI_REPO_QUERY_RESULT_OBJECT_TYPE = createObjectType({
    name: 'MultiRepoQueryResult',
    description: 'MultiRepoQueryResult description',
    fields: {
        total: { type: nonNull(GraphQLInt) },
        count: { type: nonNull(GraphQLInt) },
        hits: {
            type: list(MULTI_REPO_QUERY_HIT_OBJECT_TYPE),
            resolve: env => forceArray(env.source.hits)
        },
        aggregations: {
            type: GraphQLString,
            resolve: env => env.source.aggregations
        }
    } // fields
}); // MULTI_REPO_QUERY_RESULT_OBJECT_TYPE


export function getMultiRepoConnectionQueryCommand({ cache }) {
    return {
        type: MULTI_REPO_QUERY_RESULT_OBJECT_TYPE,
        args: {
            start: GraphQLInt,
            count: GraphQLInt,
            query: GraphQLString,
            sort:  GraphQLString,
            //aggregations: GraphQLString,
            explain: GraphQLBoolean,
            //filters: ,
        },
        resolve: env => runAsSu(() => { log.debug(`${LOG_PREFIX} query env:${toStr(env)}`);
            log.debug(`${LOG_PREFIX} query cache:${toStr(cache)}`);
            const cacheKey = JSON.stringify(forceArray(env.source)); log.debug(`${LOG_PREFIX} query cacheKey:${toStr(cacheKey)}`);
            const multiRepoConnection = cache[cacheKey];
            const res = multiRepoConnection.query({
                start:        env.args.start || 0,
                count:        env.args.count || 10,
                query:        env.args.query || '',
                sort:         env.args.sort  || '_score DESC',
                //aggregations: env.args.aggregations || '',
                explain:      env.args.explain || false
                //filters:      env.args.filters || {}
            });
            log.debug(`${LOG_PREFIX} query res:${toStr(res)}`);
            return res;
        }) // resolve
    }; // return
} // function getMultiRepoConnectionQueryCommand


export function getMultiRepoConnectCommand({ cache }) {
    return {
        type: list(createObjectType({
            name: 'multiRepoConnection',
            fields: {
                repoId:     { type: nonNull(GraphQLString) },
                branch:     { type: nonNull(GraphQLString) },
                principals: { type: list(GraphQLString   ) },
                query: getMultiRepoConnectionQueryCommand({ cache })
            }
        })), // type
        args: {
            sources: list(MULTI_REPO_QUERY_SOURCES_INPUT_TYPE)
        }, //args
        resolve: env => runAsSu(() => {       log.debug(`${LOG_PREFIX} env:${toStr(env)}`);
            const sources = env.args.sources; log.debug(`${LOG_PREFIX} sources:${toStr(sources)}`);
            const multiRepoConnection = multiRepoConnect({ sources });
            const cacheKey = JSON.stringify(sources); log.debug(`${LOG_PREFIX} cacheKey:${toStr(cacheKey)}`);
            cache[cacheKey] = multiRepoConnection;    log.debug(`${LOG_PREFIX} cache:${toStr(cache)}`);
            log.debug(`${LOG_PREFIX} res:${toStr(sources)}`);
            return sources;
        }) // resolve
    }; // return
} // function getMultiRepoConnectCommand
