const i18next = require("i18next");
const { z } = require("zod");
const { zodI18nMap } = require("zod-i18n-map");
const translation = require("zod-i18n-map/locales/id/zod.json");

// lng and resources key depend on your locale.
i18next.init({
  lng: "id",
  resources: {
    id: { zod: translation },
  },
});
z.setErrorMap(zodI18nMap);

module.exports = {
  z,
};
