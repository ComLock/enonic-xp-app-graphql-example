import { runAsSu } from '../context';
import {
    createObjectType,
    GraphQLString,
    list,
    nonNull,
} from '/lib/graphql';
import {
    //create       as repoCreate,
    //createBranch as repoCreateBranch,
    //delete       as repoDelete,
    //deleteBranch as repoDeleteBranch,
    get          as repoGet,
    list         as repoList,
    //refresh      as repoRefresh
} from '/lib/xp/repo';


export const REPO_OBJECT_TYPE = createObjectType({
    name: 'Repo',
    description: 'Repo description',
    fields: {
        id: { type: nonNull(GraphQLString), },
        branches: {
            type: list(nonNull(GraphQLString)),
            resolve: env => env.source.branches
        }
    } // fields
}); // REPO_OBJECT_TYPE


export function getRepoCommand({}) {
    return {
        type: createObjectType({
            name: 'repoCommands',
            fields: {
                get: {
                    type: REPO_OBJECT_TYPE,
                    args: {
                        id: nonNull(GraphQLString)
                    },
                    resolve: env => runAsSu(() => repoGet(env.args.id))
                },
                list: {
                    type: list(REPO_OBJECT_TYPE),
                    resolve: env => runAsSu(repoList)
                }
            } // fields
        }), // type
        resolve: env => { return {}; }
    }; // return
} // function getRepoCommand
