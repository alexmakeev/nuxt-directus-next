import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, reactive, toValue } from 'vue'
import { defu } from 'defu'
import { hash } from 'ohash'
import {
  createUser as sdkCreateUser,
  createUsers as sdkCreateUsers,
  readMe as sdkReadMe,
  readUser as sdkReadUser,
  readUsers as sdkReadUsers,
  updateMe as sdkUpdateMe,
  updateUser as sdkUpdateUser,
  updateUsers as sdkUpdateUsers,
  deleteUser as sdkDeleteUser,
  deleteUsers as sdkDeleteUsers,
} from '@directus/sdk'
import type {
  DirectusUser,
  Query,
  CreateUserOutput,
  ReadUserOutput,
  UpdateUserOutput,
} from '@directus/sdk'
import type {
  DirectusClients,
  DirectusRestConfig,
  DirectusTokens,
  ReadAsyncDataReturn,
  ReadAsyncOptionsWithQuery,
  SDKReturn,
} from '../types'
import {
  useAsyncData,
  useRuntimeConfig,
  useState,
} from '#app'
import {
  useDirectusRest,
  useDirectusTokens,
} from '#imports'

export function useDirectusUsers<TSchema>(config?: Partial<DirectusRestConfig>) {
  const {
    authConfig: {
      userStateName,
    },
    moduleConfig: {
      readMeQuery,
    },
  } = useRuntimeConfig().public.directus

  const defaultConfig: Partial<DirectusRestConfig> = {
    staticToken: false,
  }
  const client: DirectusClients.Rest<TSchema> = useDirectusRest<TSchema>(defu(config, defaultConfig))
  const { tokens }: DirectusTokens['tokens'] = useDirectusTokens(config?.staticToken ?? defaultConfig.staticToken)

  /**
   * Create a new user.
   *
   * @param userInfo The user to create.
   * @param query Optional return data query.
   *
   * @returns Returns the user object for the created user.
   */
  async function createUser<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    userInfo: Partial<DirectusUser<TSchema>>,
    query?: TQuery,
  ): SDKReturn<CreateUserOutput<TSchema, TQuery>> {
    return await client.request(sdkCreateUser(userInfo, query))
  }

  /**
   * Create multiple new users.
   *
   * @param userInfo The user to create.
   * @param query Optional return data query.
   *
   * @returns Returns the user objects for the created users.
   */
  async function createUsers<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    userInfo: Partial<DirectusUser<TSchema>>[],
    query?: TQuery,
  ): SDKReturn<CreateUserOutput<TSchema, TQuery>[]> {
    return await client.request(sdkCreateUsers(userInfo, query))
  }

  function setUser(value: Partial<DirectusUser<TSchema>> | undefined): Promise<void> {
    return new Promise((resolve) => {
      user.value = value
      resolve()
    })
  }

  /**
   * Retrieve the currently authenticated user.
   *
   * @param query The query parameters.
   *
   * @returns Returns the user object for the currently authenticated user.
   */
  async function readMe<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    query?: TQuery & { updateState?: boolean },
  ): SDKReturn<ReadUserOutput<TSchema, TQuery>> {
    const mode = useRuntimeConfig().public.directus.authConfig.mode
    if (tokens.value?.access_token || ((tokens.value?.expires > 0) && mode === 'session')) {
      const { updateState, ..._query } = defu(query, readMeQuery)
      try {
        const userData = await client.request(sdkReadMe(_query))

        if (userData && updateState !== false) {
          await setUser(userData as Partial<DirectusUser<TSchema>>)
        }

        return userData
      }
      catch (error: any) {
        if (error && error.message) {
          console.error('Couldn\'t fetch authenticated user:', error.message)
        }
        else {
          console.error(error)
        }
      }
    }
  }

  /**
   * List an existing user by primary id.
   *
   * @param id The primary id of the user.
   * @param query The query parameters.
   *
   * @returns Returns the requested user object.
   *
   * @throws Will throw if id is empty.
   */
  async function readUser<
    ID extends DirectusUser<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    id: ID,
    query?: TQuery,
  ): SDKReturn<ReadUserOutput<TSchema, TQuery>> {
    return await client.request(sdkReadUser(id, query))
  }

  /**
   * List an existing user by primary id.
   *
   * @param id The primary id of the user.
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns Returns the requested user object.
   *
   * @throws Will throw if id is empty.
   */
  async function readAsyncUser<
    ID extends DirectusUser<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    id: MaybeRefOrGetter<ID>,
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadUserOutput<TSchema, TQuery>>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadUserOutput<TSchema, TQuery>>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readUser', toValue(id), toValue(query)])
    })

    return await useAsyncData(_key.value, () => readUser(toValue(id), reactive(query ?? {})), _params)
  }

  /**
   * List all users that exist in Directus.
   *
   * @param query The query parameters.
   *
   * @returns An array of up to limit user objects. If no items are available, data will be an empty array.
   */
  async function readUsers<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    query?: TQuery,
  ): SDKReturn<ReadUserOutput<TSchema, TQuery>[]> {
    return await client.request(sdkReadUsers(query))
  }

  /**
   * List all users that exist in Directus.
   *
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns Returns the requested user object.
   */
  async function readAsyncUsers<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadUserOutput<TSchema, TQuery>>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadUserOutput<TSchema, TQuery>[]>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readUsers', toValue(query)])
    })

    return await useAsyncData(_key.value, () => readUsers(reactive(query ?? {})), _params)
  }

  /**
   * Update the authenticated user.
   *
   * @param userInfo The user data to update.
   * @param query Optional return data query.
   *
   * @returns Returns the updated user object for the authenticated user.
   */
  async function updateMe<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    userInfo: Partial<DirectusUser<TSchema>>,
    query: TQuery & { updateState?: boolean },
  ): SDKReturn<UpdateUserOutput<TSchema, TQuery>> {
    const { updateState, ..._query } = query

    return await client.request(sdkUpdateMe(userInfo, _query)).then((userData) => {
      if (userData && updateState !== false) {
        setUser(userData as Partial<DirectusUser<TSchema>>)
      }
      return userData
    })
  }

  /**
   * Update an existing user.
   *
   * @param id The primary id of the user.
   * @param userInfo The user data to update.
   * @param query Optional return data query.
   *
   * @returns Returns the user object for the updated user.
   *
   * @throws Will throw if id is empty.
   */
  async function updateUser<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    id: DirectusUser<TSchema>['id'],
    userInfo: Partial<DirectusUser<TSchema>>,
    query: TQuery,
  ): SDKReturn<UpdateUserOutput<TSchema, TQuery>> {
    return await client.request(sdkUpdateUser(id, userInfo, query))
  }

  /**
   * Update multiple existing users.
   *
   * @param ids The primary ids of the users.
   * @param userInfo The user data to update.
   * @param query Optional return data query.
   *
   * @returns Returns the user objects for the updated users.
   *
   * @throws Will throw if ids is empty.
   */
  async function updateUsers<
    TQuery extends Query<TSchema, DirectusUser<TSchema>>,
  >(
    ids: DirectusUser<TSchema>['id'][],
    userInfo: Partial<DirectusUser<TSchema>>,
    query: TQuery,
  ): SDKReturn<UpdateUserOutput<TSchema, TQuery>[]> {
    return await client.request(sdkUpdateUsers(ids, userInfo, query))
  }

  /**
   * Delete an existing user.
   *
   * @param id The primary id of the user.
   *
   * @returns Nothing.
   *
   * @throws Will throw if id is empty.
   */
  async function deleteUser(
    id: DirectusUser<TSchema>['id'],
  ): Promise<void> {
    return await client.request(sdkDeleteUser(id))
  }

  /**
   * Delete multiple existing users.
   *
   * @param ids The primary ids of the users.
   *
   * @returns Nothing.
   *
   * @throws Will throw if ids is empty.
   */
  async function deleteUsers(
    ids: DirectusUser<TSchema>['id'][],
  ): Promise<void> {
    return await client.request(sdkDeleteUsers(ids))
  }

  const user: Ref<Partial<DirectusUser<TSchema>> | undefined> = useState(userStateName, () => undefined)

  return {
    client,
    createUser,
    createUsers,
    deleteUser,
    deleteUsers,
    readMe,
    readUser,
    readAsyncUser,
    readUsers,
    readAsyncUsers,
    setUser,
    tokens,
    updateMe,
    updateUser,
    updateUsers,
    user,
  }
}
