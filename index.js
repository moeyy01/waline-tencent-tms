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
        if (isAdmin) {
          return;
        }

        const utf8Buffer = Buffer.from(data.comment, 'utf8');
        const contentBase64 = utf8Buffer.toString('base64');

        const client = new TmsClient(clientConfig);
        try {
          const resp = await client.TextModeration({ Content: contentBase64 });

          if (!resp.Suggestion) {
            throw new Error('Suggestion is empty. Tencent Cloud TMS info:', resp);
          }

          switch(resp.Suggestion) {
            case 'Pass':
              data.status = 'approved';
              break;
              case 'Block':
                if (resp.Label === 'Ad') { //因为网站链接会被判断为AD，故过滤掉
                  data.status = 'approved';
                } else {
                  data.status = 'spam';
                }
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
        // return data;
      },
    },
  };
}