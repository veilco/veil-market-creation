import { Provider, JSONRPCRequestPayload } from "@0x/subproviders";
import { Subprovider } from "@0x/subproviders/lib/src/subproviders/subprovider";

export default class NetworkIdProvider extends Subprovider {
  provider: Provider;

  constructor(provider: any) {
    super();
    if (!provider)
      throw new Error("ProviderSubprovider - no provider specified");
    if (!provider.sendAsync)
      throw new Error(
        "ProviderSubprovider - specified provider does not have a sendAsync method"
      );
    this.provider = provider;
  }

  async handleRequest(payload: JSONRPCRequestPayload, next: any, end: any) {
    if (payload.method !== "net_version") return next();
    this.provider.sendAsync(payload, function(err, response) {
      if (err) return end(err);
      if (response.error) return end(new Error(response.error.message));
      end(null, response.result);
    });
  }
}
