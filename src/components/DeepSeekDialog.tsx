import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLinkIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateConfig, useSetCurrentConfig } from "@/lib/query";
import {
	Anchor,
	Button,
	Modal,
	PasswordInput,
	Stack,
	Text,
} from "@mantine/core";

export function DeepSeekDialog(props: {
	opened: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}) {
	const { t } = useTranslation();
	const [apiKey, setApiKey] = useState("");
	const createConfigMutation = useCreateConfig();
	const setCurrentConfigMutation = useSetCurrentConfig();

	const handleCreateConfig = async () => {
		if (!apiKey.trim()) {
			return;
		}

		try {
			const store = await createConfigMutation.mutateAsync({
				title: "DeepSeek",
				settings: {
					env: {
						ANTHROPIC_AUTH_TOKEN: apiKey.trim(),
						ANTHROPIC_BASE_URL: "https://api.deepseek.com/anthropic",
						ANTHROPIC_MODEL: "deepseek-v4-pro[1m]",
						ANTHROPIC_DEFAULT_OPUS_MODEL: "deepseek-v4-pro[1m]",
						ANTHROPIC_DEFAULT_SONNET_MODEL: "deepseek-v4-pro[1m]",
						ANTHROPIC_DEFAULT_HAIKU_MODEL: "deepseek-v4-flash",
						CLAUDE_CODE_SUBAGENT_MODEL: "deepseek-v4-flash",
						CLAUDE_CODE_EFFORT_LEVEL: "max",
					},
				},
			});

			await setCurrentConfigMutation.mutateAsync(store.id);
			props.onClose();
			setApiKey("");
			props.onSuccess?.();
		} catch (error) {
			console.error("Failed to create DeepSeek config:", error);
		}
	};

	return (
		<Modal
			centered
			opened={props.opened}
			onClose={props.onClose}
			title={t("deepseek.config")}
			radius="lg"
		>
			<Stack gap="lg">
				<Text size="sm" c="dimmed">
					{t("deepseek.description")}
				</Text>

				<Stack gap="xs">
					<Text size="sm" fw={500}>
						{t("deepseek.step1")}
					</Text>
					<Anchor
						size="sm"
						onClick={() => openUrl("https://platform.deepseek.com/api_keys")}
						style={{ cursor: "pointer" }}
					>
						<ExternalLinkIcon size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
						{t("deepseek.enterConsole")}
					</Anchor>
				</Stack>

				<PasswordInput
					label={t("deepseek.step2")}
					value={apiKey}
					onChange={(e) => setApiKey(e.target.value)}
					placeholder={t("deepseek.apiKeyPlaceholder")}
					radius="md"
				/>

				<Button
					fullWidth
					radius="md"
					onClick={handleCreateConfig}
					disabled={!apiKey.trim() || createConfigMutation.isPending}
					loading={createConfigMutation.isPending}
				>
					{t("deepseek.createConfig")}
				</Button>
			</Stack>
		</Modal>
	);
}
