/* eslint-disable react/prop-types */
import React from "react";
import Link from "metabase/components/Link";
import EntityObjectLoader from "./EntityObjectLoader";

const EntityLink = ({ entityType, entityId, name = "name", ...linkProps }) => (
  <EntityObjectLoader
    entityType={entityType}
    entityId={entityId}
    properties={[name]}
    loadingAndErrorWrapper={false}
    wrapped
  >
    {({ object }) =>
      object ? (
        <Link {...linkProps} to={object.getUrl()}>
          <span>{object.getName()}</span>
        </Link>
      ) : null
    }
  </EntityObjectLoader>
);

export default EntityLink;
