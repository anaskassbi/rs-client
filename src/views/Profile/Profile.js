/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useContext,
  useState,
  Fragment,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Publications from "../Author/components/Publications";
import AuthorCitations from "../Author/components/AuthorCitations";
import Coauthors from "../Author/components/Coauthors";
import ProfileHeader from "./components/ProfileHeader";

const Profile = () => {
  const { id } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [correspondingFollowedUser, setCorrespondingFollowedUser] = useState(
    null
  );
  const { ApiServices, alertService } = useContext(AppContext);
  const { pushAlert } = alertService;
  const { userService,scraperService } = ApiServices;

  useEffect(() => {
    getProfile();
  }, [id]);

  const getProfile = useCallback(async () => {
    try {
      const response = await userService.findUser(id);
      if (response.data) {
        setProfileUser(response.data);
        setCorrespondingFollowedUser(response.data.correspondingFollowedUser);
      } else throw Error();
      console.log(response.data.correspondingFollowedUser)

      const responseScrap = await scraperService.getAuthorData("scopus", response.data.correspondingFollowedUser.authorId);
      if (responseScrap.data.author) {
        setAuthor(responseScrap.data.author);
        setLoading(false)
      } 


    } catch (error) {
      pushAlert({ message: "Incapable d'obtenir les données de profil" });
    }
  }, [id]);

  return (
    <div className="container">
      {profileUser !== null && (
        <Fragment>
          {correspondingFollowedUser != null && (
            <div className="row">
              <div className="col-md-8">
                {correspondingFollowedUser != null && (
                  <Fragment>
                    <ProfileHeader
                      profile={{
                        ...correspondingFollowedUser,
                        ...profileUser,
                      }}
                    />
                    <Publications
                      getProfile={getProfile}
                      author={correspondingFollowedUser}
                      setAuthor={setCorrespondingFollowedUser}
                    />
                  </Fragment>
                )}
              </div>

              {!loading &&(<div className="col-md-4">
                <AuthorCitations  author={author} />
                <Coauthors author={correspondingFollowedUser} />
              </div>)}
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default Profile;
