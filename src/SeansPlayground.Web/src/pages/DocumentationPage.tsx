import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppSection } from "../App";
import { DashboardLayout } from "../components/DashboardLayout";
import { documents } from "virtual:documentation";

type DocumentationPageProps = {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
};

export function DocumentationPage({ activeSection, onNavigate }: DocumentationPageProps) {
  const [activeDocumentId, setActiveDocumentId] = useState(documents[0]?.id);
  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) ?? documents[0],
    [activeDocumentId]
  );

  if (!activeDocument) {
    return (
      <DashboardLayout activeSection={activeSection} onNavigate={onNavigate}>
        <Box className="loadingPanel">No documentation is available.</Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeSection={activeSection} onNavigate={onNavigate}>
      <Box className="documentationPage">
        <Box className="documentationHero">
          <Box>
            <Typography className="backgroundKicker">Support</Typography>
            <Typography variant="h3" fontWeight={900}>
              Documentation
            </Typography>
            <Typography className="backgroundHeadline">
              Project docs rendered inside the app, including the README and everything in the docs folder.
            </Typography>
          </Box>
          <Chip className="entitlementChip" icon={<ArticleOutlinedIcon />} label={`${documents.length} documents`} />
        </Box>

        <Box className="documentationShell">
          <Box className="documentationNav" component="nav" aria-label="Documentation">
            <Typography className="panelEyebrow">Documents</Typography>
            <Stack spacing={1}>
              {documents.map((document) => (
                <Button
                  key={document.id}
                  className={document.id === activeDocument.id ? "docNavItem active" : "docNavItem"}
                  onClick={() => setActiveDocumentId(document.id)}
                  fullWidth
                >
                  <Box>
                    <Typography fontWeight={900}>{document.title}</Typography>
                    <Typography component="span">{document.sourcePath}</Typography>
                  </Box>
                </Button>
              ))}
            </Stack>
          </Box>

          <Box className="markdownPanel">
            <Box className="markdownHeader">
              <Box>
                <Typography className="panelEyebrow">Viewing</Typography>
                <Typography variant="h5" fontWeight={900}>
                  {activeDocument.title}
                </Typography>
              </Box>
              <Chip label={activeDocument.sourcePath} />
            </Box>
            <Box className="markdownBody">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a({ href, children }) {
                    const linkedDocument = findLinkedDocument(href);

                    if (linkedDocument) {
                      return (
                        <Link
                          href="#"
                          onClick={(event) => {
                            event.preventDefault();
                            setActiveDocumentId(linkedDocument.id);
                          }}
                        >
                          {children}
                        </Link>
                      );
                    }

                    return (
                      <Link href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                        {children}
                      </Link>
                    );
                  }
                }}
              >
                {activeDocument.content}
              </ReactMarkdown>
            </Box>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

function findLinkedDocument(href: string | undefined) {
  const normalizedHref = href?.split("#")[0].replace(/^\.\//, "");

  if (!normalizedHref) {
    return null;
  }

  return documents.find((document) => document.sourcePath === normalizedHref) ?? null;
}
