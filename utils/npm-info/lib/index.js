'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

//获取npm信息
function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, '@imooc-cli/core');

  return axios
    .get(npmInfoUrl)
    .then(response => {
      if (response.status == 200) {
        return response.data;
      }
      return null;
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

//默认请求链接
function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? 'https://registry.npmjs.org'
    : 'https://registry.npm.taobao.org';
}

//获取npm所有版本
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);

  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

//获取大于当前版本的所有版本号
function getSemverVersions(baseVersion, versions) {
  return versions
    .filter(version => {
      return semver.satisfies(version, `^${baseVersion}`);
    })
    .sort((a, b) => {
      return semver.gt(b, a);
    });
}
//获取最新版本号
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersion = getSemverVersions(baseVersion, versions);

  if (newVersion && newVersion.length > 0) {
    return newVersion[0];
  }
}

async function getNpmLatestVersion(npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0];
  }
  return null;
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};
