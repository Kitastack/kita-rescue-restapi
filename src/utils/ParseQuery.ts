const jsonParser = (text: any) => {
  // functionality for parsing date
  var reISO =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
  var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
  const dateParser = function (key: any, value: any) {
    if (typeof value === "string") {
      var a = reISO.exec(value);
      if (a) return new Date(value);
      a = reMsAjax.exec(value);
      if (a) {
        var b = a[1].split(/[-+,.]/);
        return new Date(b[0] ? +b[0] : 0 - +b[1]);
      }
    }
    return value;
  };
  return JSON.parse(text, dateParser);
};

export default (query: any, opts?: any) => {
  const aggregate = [];
  if (query) {
    query = jsonParser(query);
    //check another field existence
    const arrMatch = Object.entries(query).filter(
      (item) => item[0] !== "pipeline"
    );
    if (arrMatch.length >= 1) {
      const match = arrMatch?.reduce(
        (total, item) => ({ ...total, [item[0]]: item[1] }),
        {}
      );
      aggregate.push({ $match: match || null });
    }
    if (query?.pipeline) {
      aggregate.push(...query.pipeline);
    }
  }

  if (aggregate.length < 1) {
    aggregate.push({ $match: {} });
  }

  // options
  const options = {
    collation: {
      locale: "en",
    },
    // allowDiskUse: true,
    ...opts,
  };

  return { payload: query, aggregate, options };
};
