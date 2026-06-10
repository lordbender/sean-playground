import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { AppSection } from "../App";
import { useAuth } from "../auth/AuthProvider";
import { DashboardLayout } from "../components/DashboardLayout";
import { BackgroundSummary } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5100";

type BackgroundPageProps = {
  activeSection: AppSection;
  isNavCollapsed: boolean;
  onNavigate: (section: AppSection) => void;
  onToggleNavigation: () => void;
};

export function BackgroundPage({ activeSection, isNavCollapsed, onNavigate, onToggleNavigation }: BackgroundPageProps) {
  const { user } = useAuth();
  const [background, setBackground] = useState<BackgroundSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.access_token) {
      return;
    }

    fetch(`${apiBaseUrl}/api/background/sean`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status === 403 ? "Access is not enabled for this section." : "Unable to load background.");
        }

        return response.json() as Promise<BackgroundSummary>;
      })
      .then(setBackground)
      .catch((loadError: Error) => setError(loadError.message));
  }, [user?.access_token]);

  return (
    <DashboardLayout
      activeSection={activeSection}
      isNavCollapsed={isNavCollapsed}
      onNavigate={onNavigate}
      onToggleNavigation={onToggleNavigation}
    >
      {background ? (
        <Box className="backgroundPage">
          <Box className="backgroundHero">
            <Box>
              <Typography className="backgroundKicker">Sean's Background</Typography>
              <Typography variant="h3" fontWeight={900}>
                {background.profile.displayName}
              </Typography>
              <Typography className="backgroundHeadline">{background.profile.headline}</Typography>
              <Typography className="backgroundLocation">{background.profile.location}</Typography>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {background.allowedRoles.map((role) => (
                <Chip key={role} className="entitlementChip" icon={<LockOutlinedIcon />} label={role} />
              ))}
            </Stack>
          </Box>

          <Box className="backgroundGrid">
            <Box className="backgroundPanel bioPanel">
              <Typography className="panelEyebrow">Bio</Typography>
              <Typography>{background.profile.biography}</Typography>
            </Box>

            <Box className="backgroundPanel socialPanel">
              <Typography className="panelEyebrow">Social Media</Typography>
              <Stack spacing={1.5}>
                {background.socialLinks.map((link) => (
                  <SocialLink key={`${link.platformName}-${link.displayText}`} link={link} />
                ))}
              </Stack>
            </Box>

            <Box className="backgroundPanel repositoryPanel">
              <Typography className="panelEyebrow">Git Repositories</Typography>
              <Stack spacing={1.5}>
                {background.repositories.map((repository) => (
                  <Box key={`${repository.ownerName}/${repository.repositoryName}`} className="repoItem">
                    <GitHubIcon className="repoIcon" />
                    <Box>
                      <Typography fontWeight={900}>
                        {repository.ownerName}/{repository.repositoryName}
                      </Typography>
                      <Typography color="text.secondary">{repository.description}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<LaunchOutlinedIcon />}
                      href={repository.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open
                    </Button>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box className="backgroundPanel resumePanel">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ArticleOutlinedIcon color="primary" />
                <Box>
                  <Typography className="panelEyebrow">Resume Document</Typography>
                  <Typography fontWeight={900}>{background.document.title}</Typography>
                  <Typography color="text.secondary">{background.document.sourceFileName}</Typography>
                </Box>
              </Stack>
              <Divider />
              <Stack spacing={2}>
                {background.document.sections.map((section) => (
                  <Box key={section.heading}>
                    <Typography fontWeight={900}>{section.heading}</Typography>
                    <Typography color="text.secondary">{section.body}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box className="backgroundPanel experiencePanel">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <WorkHistoryOutlinedIcon color="primary" />
              <Typography variant="h5" fontWeight={900}>
                Professional Experience
              </Typography>
            </Stack>
            <Box className="experienceTimeline">
              {background.experiences.map((experience) => (
                <Box key={`${experience.organizationName}-${experience.roleTitle}-${experience.dateLabel}`} className="experienceItem">
                  <Box className="timelineDot" />
                  <Box>
                    <Typography className="experienceDates">{experience.dateLabel}</Typography>
                    <Typography variant="h6" fontWeight={900}>
                      {experience.roleTitle}
                    </Typography>
                    <Typography className="experienceOrg">
                      {experience.organizationName}
                      {experience.location ? ` | ${experience.location}` : ""}
                    </Typography>
                    {experience.highlights.length > 0 ? (
                      <Box component="ul" className="experienceHighlights">
                        {experience.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className="backgroundPanel educationPanel">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SchoolOutlinedIcon color="primary" />
              <Typography variant="h5" fontWeight={900}>
                Education
              </Typography>
            </Stack>
            <Box className="educationGrid">
              {background.education.map((education) => (
                <Box key={`${education.degreeName}-${education.fieldOfStudy}`} className="educationItem">
                  <Typography fontWeight={900}>{education.degreeName}</Typography>
                  <Typography>{education.fieldOfStudy}</Typography>
                  <Typography color="text.secondary">{education.institutionName}</Typography>
                  {education.note ? <Typography className="educationNote">{education.note}</Typography> : null}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box className="loadingPanel">{error ?? "Loading Sean's background"}</Box>
      )}
    </DashboardLayout>
  );
}

function SocialLink({ link }: { link: BackgroundSummary["socialLinks"][number] }) {
  const Icon = link.platformName === "LinkedIn" ? LinkedInIcon : FacebookIcon;

  return (
    <Box className={link.isActive ? "socialItem" : "socialItem disabled"}>
      <Icon />
      <Box>
        <Typography fontWeight={900}>{link.platformName}</Typography>
        {link.isActive ? (
          <Link href={link.url} target="_blank" rel="noreferrer">
            {link.displayText}
          </Link>
        ) : (
          <Typography color="text.secondary">{link.displayText}</Typography>
        )}
      </Box>
    </Box>
  );
}
