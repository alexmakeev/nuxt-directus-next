import { type MaybeRefOrGetter, computed, toValue } from 'vue'
import { hash } from 'ohash'
import {
  uploadFiles as sdkUploadFiles,
  importFile as sdkImportFile,
  readFile as sdkReadFile,
  readFiles as sdkReadFiles,
  updateFile as sdkUpdateFile,
  updateFiles as sdkUpdateFiles,
  deleteFile as sdkDeleteFile,
  deleteFiles as sdkDeleteFiles,
} from '@directus/sdk'
import type {
  DirectusFile,
  Query,
  CreateFileOutput,
  ReadFileOutput,
  UpdateFileOutput,
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

export function useDirectusFiles<TSchema>(config?: Partial<DirectusRestConfig>) {
  const client: DirectusClients.Rest<TSchema> = useDirectusRest<TSchema>(config)

  /**
   * Upload/create a new file.
   *
   * @param data Formdata object.
   * @param query The query parameters.
   *
   * @returns Returns the file object for the uploaded file, or an array of file objects if multiple files were uploaded at once.
   */
  async function uploadFiles<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    data: FormData,
    query?: TQuery,
  ): SDKReturn<CreateFileOutput<TSchema, TQuery>> {
    return await client.request(sdkUploadFiles(data, query))
  }

  /**
   * Import a file from the web.
   *
   * @param url The url to import the file from.
   * @param data Formdata object.
   * @param query The query parameters.
   *
   * @returns Returns the file object for the imported file.
   */
  async function importFile<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    url: string,
    data: Partial<DirectusFile<TSchema>>,
    query?: TQuery,
  ): SDKReturn<CreateFileOutput<TSchema, TQuery>> {
    return await client.request(sdkImportFile(url, data, query))
  }

  /**
   * Retrieve a single file by primary id.
   *
   * @param id The primary id of the file.
   * @param query The query parameters.
   *
   * @returns Returns a file object if a valid primary id was provided.
   *
   * @throws Will throw if id is empty.
   */
  async function readFile<
    ID extends DirectusFile<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    id: ID,
    query?: TQuery,
  ): SDKReturn<ReadFileOutput<TSchema, TQuery>> {
    return await client.request(sdkReadFile(id, query))
  }

  /**
   * Retrieve a single file by primary id.
   *
   * @param id The primary id of the file.
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns Returns a file object if a valid primary id was provided.
   *
   * @throws Will throw if id is empty.
   */
  async function readAsyncFile<
    ID extends DirectusFile<TSchema>['id'],
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    id: MaybeRefOrGetter<ID>,
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadFileOutput<TSchema, TQuery>>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadFileOutput<TSchema, TQuery>>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readAsyncFile', toValue(id), toValue(query)])
    })

    return await useAsyncData(_key.value, () => readFile(toValue(id), toValue(query) as TQuery | undefined), _params)
  }

  /**
   * List all files that exist in Directus.
   *
   * @param query The query parameters.
   *
   * @returns An array of up to limit file objects. If no items are available, data will be an empty array.
   */
  async function readFiles<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    query?: TQuery,
  ): SDKReturn<ReadFileOutput<TSchema, TQuery>[]> {
    return await client.request(sdkReadFiles(query))
  }

  /**
   * List all files that exist in Directus.
   *
   * @param params query parameters, useAsyncData options and payload key.
   *
   * @returns An array of up to limit file objects. If no items are available, data will be an empty array.
   */
  async function readAsyncFiles<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    params?: ReadAsyncOptionsWithQuery<SDKReturn<ReadFileOutput<TSchema, TQuery>[]>, TQuery>,
  ): ReadAsyncDataReturn<SDKReturn<ReadFileOutput<TSchema, TQuery>[]>> {
    const { key, query, ..._params } = params ?? {}
    const _key = computed(() => {
      return key ?? 'D_' + hash(['readAsyncFiles', toValue(query)])
    })

    return await useAsyncData(_key.value, () => readFiles(toValue(query) as TQuery | undefined), _params)
  }

  /**
   * Update an existing file, and/or replace it's file contents.
   *
   * @param id The primary id of the file.
   * @param item
   * @param query The query parameters.
   *
   * @returns Returns the file object for the updated file.
   *
   * @throws Will throw if id is empty.
   */
  async function updateFile<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    id: DirectusFile<TSchema>['id'],
    item: Partial<DirectusFile<TSchema>>,
    query?: TQuery,
  ): SDKReturn<UpdateFileOutput<TSchema, TQuery>> {
    return await client.request(sdkUpdateFile(id, item, query))
  }

  /**
   * Update multiple files at the same time.
   *
   * @param ids The primary ids of the files.
   * @param item
   * @param query The query parameters.
   *
   * @returns Returns the file objects for the updated files.
   *
   * @throws Will throw if ids is empty
   */
  async function updateFiles<
    TQuery extends Query<TSchema, DirectusFile<TSchema>>,
  >(
    ids: DirectusFile<TSchema>['id'][],
    item: Partial<DirectusFile<TSchema>>,
    query?: TQuery,
  ): SDKReturn<UpdateFileOutput<TSchema, TQuery>[]> {
    return await client.request(sdkUpdateFiles(ids, item, query))
  }

  /**
   * Delete an existing file.
   *
   * @param id The primary id of the file.
   *
   * @returns Nothing.
   *
   * @throws Will throw if id is empty.
   */
  async function deleteFile(
    id: DirectusFile<TSchema>['id'],
  ): Promise<void> {
    return await client.request(sdkDeleteFile(id))
  }

  /**
   * Delete multiple files at once.
   *
   * @param ids The primary ids of the files.
   *
   * @returns Nothing.
   *
   * @throws Will throw if ids is empty.
   */
  async function deleteFiles(
    ids: DirectusFile<TSchema>['id'][],
  ): Promise<void> {
    return await client.request(sdkDeleteFiles(ids))
  }

  return {
    client,
    uploadFiles,
    importFile,
    readFile,
    readAsyncFile,
    readFiles,
    readAsyncFiles,
    updateFile,
    updateFiles,
    deleteFile,
    deleteFiles,
  }
}
