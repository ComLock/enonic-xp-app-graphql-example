import { NODE_OBJECT_TYPE } from './node';
import { runAsSu } from '../context';
import { toStr } from '/lib/enonic/util';
import {
    createObjectType,
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLInt,
    GraphQLString,
    list,
    nonNull
} from '/lib/graphql';
import { connect } from '/lib/xp/node';


const NAME       = 'schema/repoConnection';
const TYPE       = 'lib';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export function getRepoConnectionGetCommand({ cache }) {
    return {
        type: NODE_OBJECT_TYPE,
        args: {
            key: nonNull(GraphQLString)
        },
        resolve: env => runAsSu(() => {
            log.debug(`${LOG_PREFIX} get env:${toStr(env)}`);
            const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
            const node = connection.get(env.args.key);
            log.debug(`${LOG_PREFIX} get node:${toStr(node)}`);
            return node;
        }) // resolve
    }; // return
} // function getRepoConnectionGetCommand


export function getRepoConnectionDiffCommand({ cache }) {
    return {
        type: list(createObjectType({
            name: 'repoConnectionDiffObject',
            fields: {
                id:     { type: nonNull(GraphQLString) },
                status: { type: nonNull(GraphQLString) }
            }
        })),
        args: {
            key:    nonNull(GraphQLString),
            target: nonNull(GraphQLString)//,
            //includeChildren: GraphQLBoolean
        },
        resolve: env => runAsSu(() => {
            log.debug(`${LOG_PREFIX} diff env:${toStr(env)}`);
            const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
            const node = connection.diff({
                key:             env.args.key,
                target:          env.args.target//,
                //includeChildren: env.args.includeChildren || false
            });
            log.debug(`${LOG_PREFIX} diff node:${toStr(node)}`);
            return node;
        }) // resolve
    }; // return
} // function getRepoConnectionDiffCommand


export function getRepoConnectionFindChildrenCommand({ cache }) {
    return {
        type: createObjectType({
            name: 'repoConnectionFindChildrenResult',
            fields: {
                total: { type: nonNull(GraphQLInt) },
                count: { type: nonNull(GraphQLInt) },
                hits:  { type: list(createObjectType({
                    name: 'repoConnectionFindChildrenResultHit',
                    fields: {
                        id: { type: nonNull(GraphQLString) },
                        repoId: { type: nonNull(GraphQLString) },
                        branch: { type: nonNull(GraphQLString) },
                        node: {
                            type: NODE_OBJECT_TYPE,
                            resolve: env => runAsSu(() => {
                                //log.debug(`${LOG_PREFIX} findChildren hit node resolve env:${toStr(env)}`);
                                //log.debug(`${LOG_PREFIX} findChildren hit node resolve cache:${toStr(cache)}`);
                                const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
                                const node = connection.get(env.source.id);
                                //log.debug(`${LOG_PREFIX} findChildren hit node:${toStr(node)}`);
                                return node;
                            }) // resolve
                        } // node
                    }
                }))} // hits
            } // fields
        }), // type
        args: {
            parentKey:  nonNull(GraphQLString),
            start:      GraphQLInt,
            count:      GraphQLInt,
            childOrder: GraphQLString,
            countOnly:  GraphQLBoolean,
            recursive:  GraphQLBoolean,
        }, // args
        resolve: env => runAsSu(() => {
            log.debug(`${LOG_PREFIX} findChildren env:${toStr(env)}`);
            log.debug(`${LOG_PREFIX} findChildren cache:${toStr(cache)}`);
            const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
            const res = connection.findChildren({
                parentKey:  env.args.parentKey,
                start:      env.args.start      || 0,  // TODO use isSet
                count:      env.args.count      || 10, // TODO use isSet
                childOrder: env.args.childOrder || '',
                countOnly:  env.args.countOnly  || false,
                recursive:  env.args.recursive  || false,
            });
            res.hits = res.hits.map(hit => {
                hit.repoId = env.source.repoId;
                hit.branch = env.source.branch;
                return hit;
            });
            log.debug(`${LOG_PREFIX} findChildren res:${toStr(res)}`);
            return res;
        }) // resolve
    }; // return
} // function getRepoConnectionFindChildrenCommand


export function getRepoConnectionQueryCommand({ cache }) {
    return {
        type: createObjectType({
            name: 'repoConnectionQueryResult',
            fields: {
                total:        { type: nonNull(GraphQLInt) },
                count:        { type: nonNull(GraphQLInt) },
                hits:         { type: list(createObjectType({
                    name: 'repoConnectionQueryResultHit',
                    fields: {
                        id:     { type: nonNull(GraphQLString) },
                        score:  { type: nonNull(GraphQLFloat ) },
                        repoId: { type: nonNull(GraphQLString) },
                        branch: { type: nonNull(GraphQLString) },
                        node: {
                            type: NODE_OBJECT_TYPE,
                            resolve: env => runAsSu(() => {
                                log.debug(`${LOG_PREFIX} query hit node resolve env:${toStr(env)}`);
                                log.debug(`${LOG_PREFIX} query hit node resolve cache:${toStr(cache)}`);
                                const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
                                const node = connection.get(env.source.id);
                                log.debug(`${LOG_PREFIX} node:${toStr(node)}`);
                                return node;
                            }) // resolve
                        } // node
                    }
                })) },
                //aggregations: { type: GraphQLString }//,
                //explain: { type: GraphQLString }
            } // fields
        }), // type
        args: {
            start: GraphQLInt,
            count: GraphQLInt,
            query: nonNull(GraphQLString),
            sort:  GraphQLString,
            //aggregations: GraphQLString,
            explain: GraphQLBoolean//,
            //filters: ,
        }, // args
        resolve: env => runAsSu(() => {
            log.debug(`${LOG_PREFIX} query env:${toStr(env)}`);
            const connection = cache[env.source.repoId][env.source.branch]; // lookup connection in cache
            const res = connection.query({
                start:        env.args.start || 0,  // TODO use isSet
                count:        env.args.count || 10, // TODO use isSet
                query:        env.args.query || '',
                sort:         env.args.sort  || '_score DESC',
                //aggregations: env.args.aggregations || '',
                explain:      env.args.explain || false
                //filters:      env.args.filters || {}
            });
            res.hits = res.hits.map(hit => {
                hit.repoId = env.source.repoId;
                hit.branch = env.source.branch;
                return hit;
            });
            log.debug(`${LOG_PREFIX} query res:${toStr(res)}`);
            return res;
        }) // resolve
    }; // return
} // function getRepoConnectionQueryCommand


export function getConnectCommand({ cache }) {
    return {
        type: createObjectType({
            name: 'repoConnection',
            fields: {
                repoId: { type: nonNull(GraphQLString) },
                branch: { type: nonNull(GraphQLString) },
                diff:         getRepoConnectionDiffCommand({ cache }),
                get:          getRepoConnectionGetCommand({ cache }),
                findChildren: getRepoConnectionFindChildrenCommand({ cache }),
                query:        getRepoConnectionQueryCommand({ cache }),
            } // fields
        }),
        args: {
            repoId: nonNull(GraphQLString),
            branch: GraphQLString
        },//NODE_CONNECT_INPUT_TYPE,
        resolve: env => runAsSu(() => {
            const repoId = env.args.repoId;
            log.debug(`${LOG_PREFIX} connect repoId:${toStr(repoId)}`);
            const branch = env.args.branch || 'master';
            log.debug(`${LOG_PREFIX} connect branch:${toStr(branch)}`);
            cache[repoId] = { // Cache the connection
                [branch]: connect({
                    repoId,
                    branch
                })
            }
            const res = {
                repoId,
                branch
            };
            log.debug(`${LOG_PREFIX} connect res:${toStr(res)}`);
            return res;
        }) // resolve
    }; // return
} // function getConnectCommand
