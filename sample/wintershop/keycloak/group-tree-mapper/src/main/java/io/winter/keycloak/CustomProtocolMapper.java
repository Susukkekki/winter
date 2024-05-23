package io.winter.keycloak;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.keycloak.models.ClientSessionContext;
import org.keycloak.models.GroupModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.ProtocolMapperModel;
import org.keycloak.models.UserSessionModel;
import org.keycloak.models.utils.KeycloakModelUtils;
import org.keycloak.protocol.ProtocolMapperUtils;
import org.keycloak.protocol.oidc.mappers.AbstractOIDCProtocolMapper;
import org.keycloak.protocol.oidc.mappers.OIDCAccessTokenMapper;
import org.keycloak.protocol.oidc.mappers.OIDCAttributeMapperHelper;
import org.keycloak.protocol.oidc.mappers.OIDCIDTokenMapper;
import org.keycloak.protocol.oidc.mappers.UserInfoTokenMapper;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.representations.IDToken;

public class CustomProtocolMapper extends AbstractOIDCProtocolMapper implements OIDCAccessTokenMapper,
        OIDCIDTokenMapper, UserInfoTokenMapper {

    public static final String PROVIDER_ID = "oidc-group-tree-mapper";

    private static final List<ProviderConfigProperty> configProperties = new ArrayList<>();

    static {
        // ProviderConfigProperty property;
        // property = new ProviderConfigProperty();
        // property.setName(ProtocolMapperUtils.USER_ATTRIBUTE);
        // property.setLabel(ProtocolMapperUtils.USER_MODEL_ATTRIBUTE_LABEL);
        // property.setHelpText(ProtocolMapperUtils.USER_MODEL_ATTRIBUTE_HELP_TEXT);
        // property.setType(ProviderConfigProperty.STRING_TYPE);
        // configProperties.add(property);

        // OIDCAttributeMapperHelper.addTokenClaimNameConfig(configProperties);
        OIDCAttributeMapperHelper.addIncludeInTokensConfig(configProperties, CustomProtocolMapper.class);
    }

    @Override
    public String getDisplayCategory() {
        return TOKEN_MAPPER_CATEGORY;
    }

    @Override
    public String getDisplayType() {
        return "Group Tree Mapper";
    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return configProperties;
    }

    @Override
    public String getHelpText() {
        return "Adds group tree info to the claim";
    }

    public static AbstractMap.SimpleEntry<String,String> buildGroupPath(GroupModel group) {
        return new AbstractMap.SimpleEntry<>(group.getId(), KeycloakModelUtils.buildGroupPath(group));
    }

    public void removeSubGroups(List<AbstractMap.SimpleEntry<String, String>> membership) {
        Map<String, Object> mapToDelete = new HashMap<>();

        for (int i=0; i<membership.size()-1; i++) {
            String sourceGroupId = membership.get(i).getKey();
            if (mapToDelete.containsKey(sourceGroupId) == true) {
                continue;
            }

            String sourcePath = membership.get(i).getValue();
            for (int j=i+1; j<membership.size(); j++) {
                String targetGroupId = membership.get(j).getKey();
                String targetPath = membership.get(j).getValue();

                if (targetPath.startsWith(String.format("%s/", sourcePath))) {
                    mapToDelete.put(targetGroupId, membership.get(j));
                } else if (sourcePath.startsWith(String.format("%s/", targetPath))) {
                    mapToDelete.put(sourceGroupId, membership.get(i));
                    break;
                }
            }
        }

        for (String key : mapToDelete.keySet()) {
            membership.remove(mapToDelete.get(key));
        }
    }

    private void traverseGroup(GroupModel groupModel, Map<String, Object> parent_map) {
        Map<String, Object> subGroupMap = new HashMap<>();

        for (GroupModel subGroup : groupModel.getSubGroupsStream().toList()) {
            traverseGroup(subGroup, subGroupMap);
        }

        parent_map.put(groupModel.getName(), subGroupMap);
    }

    @Override
    protected void setClaim(IDToken token, ProtocolMapperModel mappingModel, UserSessionModel userSession,
            KeycloakSession keycloakSession, ClientSessionContext clientSessionCtx) {        
        // Get User Groups and remove sub groups
        List<AbstractMap.SimpleEntry<String,String>> membership = userSession.getUser().getGroupsStream().map(CustomProtocolMapper::buildGroupPath).collect(Collectors.toList());
        removeSubGroups(membership);

        Map<String, String> membershipMap = membership.stream().collect(Collectors.toMap(i-> i.getKey(), i -> i.getValue()));

        // Build Group Tree
        Map<String, Object> rootMap = new HashMap<>();
        for (GroupModel groupModel : userSession.getRealm().getGroupsStream().toList()) {
            if (membershipMap.containsKey(groupModel.getId())) {
                traverseGroup(groupModel, rootMap);
            }
        }

        // force multivalued as the attribute is not defined for this mapper
        mappingModel.getConfig().put(ProtocolMapperUtils.MULTIVALUED, "true");
        // Add Group
        mappingModel.getConfig().put(OIDCAttributeMapperHelper.TOKEN_CLAIM_NAME, "group.list");
        OIDCAttributeMapperHelper.mapClaim(token, mappingModel, membership.stream().map(i -> i.getValue()).collect(Collectors.toList()));
        // Add Group Tree to the Claim
        mappingModel.getConfig().put(OIDCAttributeMapperHelper.TOKEN_CLAIM_NAME, "group.tree");
        OIDCAttributeMapperHelper.mapClaim(token, mappingModel, rootMap);
    }
}
