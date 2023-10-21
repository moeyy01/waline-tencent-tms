const tencentcloud = require("tencentcloud-sdk-nodejs-tms");
const TmsClient = tencentcloud.tms.v20201229.Client;


module.exports = function({secretId, secretKey, region}) {
  if (!secretId || !secretKey || !region) {
    return {};
  }

  const clientConfig = {
    credential: {
      secretId,
      secretKey,
    },
    region,
    profile: {
      httpProfile: {
        endpoint: "tms.tencentcloudapi.com",
      },
    },
  };
  
  return {
    hooks: {
      async preSave(data) {
        const { userInfo } = this.ctx.state;
        const isAdmin = userInfo.type === 'administrator';
        // ignore admin comment
        if (isAdmin) {
          return;
        }

        const client = new TmsClient(clientConfig);
        try {
          const resp = Buffer.from(await client.TextModeration({ Content: data.comment })).toString('base64');
          if (!resp.Suggestion) {
            throw new Error('Suggestion is empty. Tencent Cloud TMS info:', resp);
          }

          switch(resp.Suggestion) {
            case 'Pass':
              data.status = 'approved';
              break;
            case 'Block':
              data.status = 'spam';
              break;
              case 'Review':
              default:
                data.status = 'waiting';
                break;
          }
        } catch(e) {
          console.log(e);
          data.status = 'waiting';
        }
      },
    },
  };
}