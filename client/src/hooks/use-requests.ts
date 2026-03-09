import { useMutation } from "@tanstack/react-query";
import { api, type RequestInput, type RequestResponse } from "@shared/routes";

export function useCreateRequest() {
  return useMutation({
    mutationFn: async (data: RequestInput): Promise<RequestResponse> => {
      // Validate payload before sending just to be safe
      const validated = api.requests.create.input.parse(data);
      
      const res = await fetch(api.requests.create.path, {
        method: api.requests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.requests.create.responses[400].parse(await res.json());
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to submit request");
      }

      return api.requests.create.responses[201].parse(await res.json());
    },
  });
}
