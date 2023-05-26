# livedigital-sdk-example

## Installation

Use the package manager [yarn](https://yarnpkg.com/getting-started/install) or npm to install the application dependencies.

```bash
yarn install
npm install
```

Run the application in **dev** environment

First you need create [application](https://management-api.livedigital.space/doc/#/applications/post_clients_applications)
and [channel](https://management-api.livedigital.space/doc/#/channels/post_clients_applications__appId__channels)
in [management API](https://management-api.livedigital.space/doc/) and provide applicationId, channelId and sdkSecret in
src/config.ts
More information about [management API](https://management-api.livedigital.space/doc/) methods you can find in our
[api docs](https://vlprojects.github.io/docs/LivedigitalManagementAPI/ManagementAPI/)

You can also check our [web sdk documentation](https://vlprojects.github.io/docs/LivedigitalWebSDK/GettingStarted/)

In accordance with the security policy, access to media servers is temporarily allowed only from the
dev.livedigital.space domain on port 3000, add this entry to your hosts file

```bash
# dev (on https://dev.livedigital.space:3000)
sudo sh -c "echo '127.0.0.1 dev.livedigital.space' >> /etc/hosts"
```

Now you can run the example

```bash
yarn dev
```
