import { type MaybeRefOrGetter, computed, reactive, toValue } from 'vue'
import { hash } from 'ohash'
import {
  readRevision as sdkReadRevision,
  readRevisions as sdkReadRevisions,
} from '@directus/sdk'
import type {
  DirectusRevision,
  Query,
  ReadRevisionOutput,
} from '@directus/sdk'
import type {
  DirectusRestConfig,
  DirectusClients,
  ReadAsyncOptionsWithQuery,
  ReadAsyncDataReturn,
  SDKReturn,
} from '../types'
import { useAsyncData } from '#app'
import { useDirectusRest } from '#imports'

export function useDirectusRevisions<TSchema>(config?: Partial<DirectusRestConfig>) {
  const client: DirectusClients.Rest<TSchema> = useDirectusRest<TSchema>(config)

  /**
   * List an existing Revision by primary id.
   *
   * @param id The primary id of the dashboard.
   * @param query The query parameters.
   *
   * @returns Returns a Revision object if a valid primary id was provided.
   *
   * @throws Will throw if id is empty.
   */
  async function readRevision<
    ID extends DirectusRevision<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusRevision<TSchema>>,
  >(
    id: ID,
    query?: TQuery,
  ): SDKReturn<ReadRevisionOutput<TSchema, TQuery>> {
    return await client.request(sdkReadRevision(id, query))
  }

  /**
   * List an existing Revision by primary id.
   *
   * @param id The primary id of the dashboard.
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns Returns a Revision object if a valid primary id was provided.
   *
   * @throws Will throw if id is empty.
   */
  async function readAsyncRevision<
    ID extends DirectusRevision<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusRevision<TSchema>>,
  >(
    id: MaybeRefOrGetter<ID>,
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadRevisionOutput<TSchema, TQuery>>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadRevisionOutput<TSchema, TQuery>>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readAsyncRevision', toValue(id), toValue(query)])
    })

    return await useAsyncData(_key.value, () => readRevision(toValue(id), reactive(query ?? {})), _params)
  }

  /**
   * List all Revisions that exist in Directus.
   *
   * @param query The query parameters.
   *
   * @returns An array of up to limit Revision objects. If no items are available, data will be an empty array.
   */
  async function readRevisions<
    TQuery extends Query<TSchema, DirectusRevision<TSchema>>,
  >(
    query?: TQuery,
  ): SDKReturn<ReadRevisionOutput<TSchema, TQuery>[]> {
    return await client.request(sdkReadRevisions(query))
  }

  /**
   * List all Revisions that exist in Directus.
   *
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns An array of up to limit Revision objects. If no items are available, data will be an empty array.
   */
  async function readAsyncRevisions<
    TQuery extends Query<TSchema, DirectusRevision<TSchema>>,
  >(
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadRevisionOutput<TSchema, TQuery>[]>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadRevisionOutput<TSchema, TQuery>[]>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readAsyncRevisions', toValue(query)])
    })

    return await useAsyncData(_key.value, () => readRevisions(reactive(query ?? {})), _params)
  }

  return {
    client,
    readRevision,
    readAsyncRevision,
    readRevisions,
    readAsyncRevisions,
  }
}
