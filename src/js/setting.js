const USER_PREF_DEFAULTS = {
  version: 2,

  themes: {
    customThemeAllow: {
      defValue: true,
      userValue: null,
    },
    theme: {
      defValue: "dark",
      userValue: null,
    },
  },

  audioAllow: true,

  keyboard: {
    key_theme: {
      defValue: "t",
      userValue: null,
    },
    key_mute: {
      defValue: "m",
      userValue: null,
    },
    key_open: {
      defValue: "o",
      userValue: null,
    },
  },
};

// get the user pref and return the object
function getUserPref() {
  const saved = localStorage.getItem("userPref");

  if (!saved) {
    saveUserPref(USER_PREF_DEFAULTS);
    return JSON.parse(JSON.stringify(USER_PREF_DEFAULTS));
  }

  let userPref;

  try {
    userPref = JSON.parse(saved);
  } catch {
    saveUserPref(USER_PREF_DEFAULTS);
    return JSON.parse(JSON.stringify(USER_PREF_DEFAULTS));
  }

  if (userPref.version !== USER_PREF_DEFAULTS.version) {
    userPref = migrateUserPref(userPref);
  }

  return userPref;
}

// in the case of schema change
function migrateUserPref(userPref) {
  function mergeDefaults(current, defaults) {
    for (const key in defaults) {
      // New key: add it
      if (!(key in current)) {
        current[key] = structuredClone(defaults[key]);
        continue;
      }

      // If this is a preference value
      if (typeof defaults[key] === "object" && "defValue" in defaults[key]) {
        // Guard against corrupted data where current[key] isn't an object
        if (typeof current[key] !== "object" || current[key] === null) {
          current[key] = structuredClone(defaults[key]);
          continue;
        }

        // Update default only
        if (current[key].userValue === null) {
          current[key].defValue = defaults[key].defValue;
        }

        continue;
      }

      // Nested object
      if (typeof defaults[key] === "object") {
        // Guard against corrupted data where current[key] isn't an object
        if (typeof current[key] !== "object" || current[key] === null) {
          current[key] = structuredClone(defaults[key]);
          continue;
        }

        mergeDefaults(current[key], defaults[key]);
      }
    }

    // Remove old keys
    for (const key in current) {
      if (!(key in defaults)) {
        delete current[key];
      }
    }
  }

  mergeDefaults(userPref, USER_PREF_DEFAULTS);
  userPref.version = USER_PREF_DEFAULTS.version;
  saveUserPref(userPref);
  return userPref;
}

// READ user preference
function resolvePrefValue(prefNode) {
  return prefNode.userValue !== null ? prefNode.userValue : prefNode.defValue;
}

// WRITE user preference
// (rootUserPref is the full object returned by getUserPref, needed to persist)
function setUserPrefValue(rootUserPref, prefNode, value) {
  prefNode.userValue = value;
  saveUserPref(rootUserPref);
}

// saves modified object as new
function saveUserPref(newUserPref) {
  localStorage.setItem("userPref", JSON.stringify(newUserPref));
}

function resetPrefValue(rootUserPref, prefNode) {
  prefNode.userValue = null;
  saveUserPref(rootUserPref);
}

export {
  getUserPref,
  resolvePrefValue,
  setUserPrefValue,
  saveUserPref,
  resetPrefValue,
};

/*
const userPref = getUserPref()
resolvePrefValue(userPref.themes.theme)
setUserPrefValue(userPref, userPref.themes.theme, "light")
resetPrefValue(userPref, userPref.themes.theme)
*/
