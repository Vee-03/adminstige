import { apiCall, API_ENDPOINTS, ApiError } from "./api";
import type { ApiResponse } from "./api";
import {
  getMockDestinations,
  createMockDestination,
  updateMockDestination,
  deleteMockDestination,
} from "./mockAPI";

export interface Destination {
  uuid?: string;
  name: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  categories: string[];
  image_urls: string[];
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DestinationListResponse {
  items: Destination[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}

async function tryApiWithMockFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  mockCall: () => Promise<any>,
  isLikelyNetworkError: (error: any) => boolean
): Promise<ApiResponse<T>> {
  try {
    return await apiCall();
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      console.log("API not available, using mock data");
      return await mockCall();
    }
    throw error;
  }
}

function isNetworkError(error: any): boolean {
  if (error instanceof ApiError && error.status === 0) {
    return true;
  }
  return false;
}

function normalizeDestination(item: any): Destination {
  return {
    uuid: item?.uuid,
    name: item?.name,
    location: item?.location,
    description: item?.description || "",
    price:
      typeof item?.price === "string" ? Number(item.price) : item?.price ?? 0,
    rating:
      typeof item?.rating === "string"
        ? Number(item.rating)
        : item?.rating ?? 0,
    categories: Array.isArray(item?.categories) ? item.categories : [],
    image_urls: Array.isArray(item?.image_urls) ? item.image_urls : [],
    owner_id: item?.owner_id || item?.owner?.id || "",
    created_at: item?.created_at,
    updated_at: item?.updated_at,
  };
}

export async function getDestinations(
  page = 1,
  perPage = 15,
  search?: string
): Promise<ApiResponse<DestinationListResponse>> {
  let endpoint = `${API_ENDPOINTS.DESTINATIONS}?page=${page}&per_page=${perPage}`;
  if (search) {
    endpoint += `&search=${encodeURIComponent(search)}`;
  }

  const rawResponse = await tryApiWithMockFallback(
    () => apiCall(endpoint),
    () => getMockDestinations(page, perPage, search),
    isNetworkError
  );

  const maybeArray = rawResponse.data as any;
  if (Array.isArray(maybeArray)) {
    const items = maybeArray.map(normalizeDestination);
    const pagination =
      (rawResponse as any).meta?.pagination ||
      (rawResponse as any).pagination ||
      null;
    const current_page = pagination?.current_page ?? page;
    const per_page = pagination?.per_page ?? perPage;
    const total = pagination?.total ?? items.length;
    const last_page = pagination?.last_page ?? 1;

    return {
      status: rawResponse.status,
      message: rawResponse.message,
      data: {
        items,
        current_page,
        total,
        per_page,
        last_page,
      },
    };
  }

  const dataObj = (rawResponse.data || {}) as any;
  const itemsRaw = Array.isArray(dataObj.items) ? dataObj.items : [];
  const items = itemsRaw.map(normalizeDestination);
  const pagination =
    dataObj.meta?.pagination ||
    (rawResponse as any).meta?.pagination ||
    dataObj.pagination ||
    null;
  const current_page = pagination?.current_page ?? dataObj.current_page ?? page;
  const per_page = pagination?.per_page ?? dataObj.per_page ?? perPage;
  const total = pagination?.total ?? dataObj.total ?? items.length;
  const last_page = pagination?.last_page ?? dataObj.last_page ?? 1;

  return {
    status: rawResponse.status,
    message: rawResponse.message,
    data: {
      items,
      current_page,
      total,
      per_page,
      last_page,
    },
  };
}

export async function getDestination(
  uuid: string
): Promise<ApiResponse<{ destination: Destination }>> {
  return apiCall(API_ENDPOINTS.DESTINATION_DETAIL(uuid));
}

export async function createDestination(
  data: Omit<Destination, "uuid" | "created_at" | "updated_at">
): Promise<ApiResponse<Destination>> {
  return tryApiWithMockFallback(
    async () => {
      const DEFAULT_OWNER_UUID = "019a7722-3511-710b-9b3f-e77a2b5100b9";
      const payload: any = { ...data };
      if (
        payload.owner_id === undefined ||
        payload.owner_id === null ||
        payload.owner_id === ""
      ) {
        payload.owner_id = DEFAULT_OWNER_UUID;
      } else {
        payload.owner_id = String(payload.owner_id);
      }

      const resp: any = await apiCall(API_ENDPOINTS.CREATE_DESTINATION, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const destRaw = resp?.data?.destination ?? resp?.data;
      const dest = normalizeDestination(destRaw);
      return {
        status: resp.status,
        message: resp.message,
        data: dest,
      } as ApiResponse<Destination>;
    },
    () => createMockDestination(data),
    isNetworkError
  );
}

export async function updateDestination(
  uuid: string,
  data: Partial<Omit<Destination, "uuid" | "created_at" | "updated_at">>
): Promise<ApiResponse<Destination>> {
  return tryApiWithMockFallback(
    async () => {
      // PERBAIKAN UTAMA: Untuk update, JANGAN kirim owner_id sama sekali
      // Backend akan tetap gunakan owner_id yang sudah tersimpan
      const payload: any = {};

      // Copy hanya field yang benar-benar ada dan bukan owner_id
      if (data.name !== undefined) payload.name = data.name;
      if (data.location !== undefined) payload.location = data.location;
      if (data.description !== undefined)
        payload.description = data.description;
      if (data.price !== undefined) payload.price = data.price;
      if (data.rating !== undefined) payload.rating = data.rating;
      if (data.categories !== undefined) payload.categories = data.categories;
      if (data.image_urls !== undefined) payload.image_urls = data.image_urls;

      console.log("Update payload:", payload);

      const resp: any = await apiCall(API_ENDPOINTS.UPDATE_DESTINATION(uuid), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const destRaw = resp?.data?.destination ?? resp?.data;
      const dest = normalizeDestination(destRaw);
      return {
        status: resp.status,
        message: resp.message,
        data: dest,
      } as ApiResponse<Destination>;
    },
    () => updateMockDestination(uuid, data),
    isNetworkError
  );
}

export async function deleteDestination(
  uuid: string
): Promise<ApiResponse<any>> {
  return tryApiWithMockFallback(
    () =>
      apiCall(API_ENDPOINTS.DELETE_DESTINATION(uuid), {
        method: "DELETE",
      }),
    () => deleteMockDestination(uuid),
    isNetworkError
  );
}
