import { DeepSeek, Kimi, Minimax, ZAI } from "@lobehub/icons";
import {
	ActionIcon,
	Badge,
	Button,
	Divider,
	Menu,
	Paper,
	Text,
} from "@mantine/core";
import { PencilLineIcon, PlusIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GLMDialog } from "@/components/GLMBanner";
import { DeepSeekDialog } from "@/components/DeepSeekDialog";
import { KimiDialog } from "@/components/KimiDialog";
import { MiniMaxDialog } from "@/components/MiniMaxDialog";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import {
	useCreateConfig,
	useResetToOriginalConfig,
	useSetCurrentConfig,
	useStores,
} from "../lib/query";

export function ConfigSwitcherPage() {
	return (
		<div>
			<section>
				<ConfigStores />
			</section>
		</div>
	);
}

function RadioIndicator({ active }: { active: boolean }) {
	return (
		<div
			className={cn(
				"w-4 h-4 rounded-full border-2 shrink-0 transition-colors duration-150",
				active
					? "border-[var(--mantine-color-brand-6)] bg-[var(--mantine-color-brand-6)]"
					: "border-[var(--mantine-color-gray-4)]",
			)}
		>
			{active && (
				<div className="w-full h-full rounded-full flex items-center justify-center">
					<div className="w-1.5 h-1.5 rounded-full bg-white" />
				</div>
			)}
		</div>
	);
}

function ConfigStores() {
	const { t } = useTranslation();
	const { data: stores } = useStores();
	const setCurrentStoreMutation = useSetCurrentConfig();
	const resetToOriginalMutation = useResetToOriginalConfig();
	const navigate = useNavigate();

	const isOriginalConfigActive = !stores.some((store) => store.using);

	const handleStoreClick = (storeId: string, isCurrentStore: boolean) => {
		if (!isCurrentStore) {
			setCurrentStoreMutation.mutate(storeId);
		}
	};

	const handleOriginalConfigClick = () => {
		if (!isOriginalConfigActive) {
			resetToOriginalMutation.mutate();
		}
	};

	const createStoreMutation = useCreateConfig();

	const onCreateStore = async () => {
		const store = await createStoreMutation.mutateAsync({
			title: t("configSwitcher.newConfig"),
			settings: {},
		});
		navigate(`/edit/${store.id}`);
	};

	const [glmOpen, setGlmOpen] = useState(false);
	const [minimaxOpen, setMinimaxOpen] = useState(false);
	const [kimiOpen, setKimiOpen] = useState(false);
	const [deepseekOpen, setDeepseekOpen] = useState(false);

	const headerActions = (
		<Menu position="bottom-end">
			<Menu.Target>
				<Button variant="subtle" size="xs" leftSection={<PlusIcon size={14} />}>
					{t("configSwitcher.createConfig")}
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<PlusIcon size={14} />}
					onClick={onCreateStore}
				>
					{t("configSwitcher.newConfig")}
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					leftSection={<ZAI size={16} />}
					onClick={() => setGlmOpen(true)}
				>
					{t("glm.useZhipuGlm")}
				</Menu.Item>
				<Menu.Item
					leftSection={<Minimax size={16} />}
					onClick={() => setMinimaxOpen(true)}
				>
					{t("minimax.useMiniMax")}
				</Menu.Item>
				<Menu.Item
					leftSection={<Kimi size={16} />}
					onClick={() => setKimiOpen(true)}
				>
					{t("kimi.useKimi")}
				</Menu.Item>
				<Menu.Item
					leftSection={<DeepSeek size={16} />}
					onClick={() => setDeepseekOpen(true)}
				>
					{t("deepseek.useDeepSeek")}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);

	return (
		<div>
			<PageHeader
				title={t("configSwitcher.title")}
				description={t("configSwitcher.description")}
				actions={headerActions}
			/>

			<div className="px-5 pb-5">
				<Paper
					withBorder
					p={0}
					style={{ overflow: "hidden" }}
				>
					{/* Original config row */}
					<div
						onClick={handleOriginalConfigClick}
						className={cn(
							"flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150",
							isOriginalConfigActive
								? "bg-[color-mix(in_srgb,var(--mantine-color-brand-6)_4%,transparent)]"
								: "hover:bg-[hsl(var(--foreground)/0.02)]",
						)}
					>
						<RadioIndicator active={isOriginalConfigActive} />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<Text
									fw={isOriginalConfigActive ? 600 : 500}
									size="sm"
								>
									{t("configSwitcher.originalConfig")}
								</Text>
								<Badge variant="light" color="gray" size="xs">
									{t("configSwitcher.default")}
								</Badge>
							</div>
							<Text size="xs" c="dimmed" mt={2}>
								{t("configSwitcher.originalConfigDescription")}
							</Text>
						</div>
					</div>

					{/* User config rows */}
					{stores.map((store) => {
						const isCurrentStore = store.using;
						return (
							<Fragment key={store.id}>
								<Divider />
								<div
									onClick={() =>
										handleStoreClick(store.id, isCurrentStore)
									}
									className={cn(
										"flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150",
										isCurrentStore
											? "bg-[color-mix(in_srgb,var(--mantine-color-brand-6)_4%,transparent)]"
											: "hover:bg-[hsl(var(--foreground)/0.02)]",
									)}
								>
									<RadioIndicator active={isCurrentStore} />
									<div className="flex-1 min-w-0">
										<Text
											fw={isCurrentStore ? 600 : 500}
											size="sm"
										>
											{store.title}
										</Text>
										{store.settings.env?.ANTHROPIC_BASE_URL && (
											<Text
												size="xs"
												c="dimmed"
												truncate
												mt={2}
												title={
													store.settings.env.ANTHROPIC_BASE_URL
												}
											>
												{store.settings.env.ANTHROPIC_BASE_URL}
											</Text>
										)}
									</div>
									<ActionIcon
										variant="transparent"
										color="dimmed"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/edit/${store.id}`);
										}}
									>
										<PencilLineIcon size={14} />
									</ActionIcon>
								</div>
							</Fragment>
						);
					})}
				</Paper>

				{stores.length === 0 && (
					<div className="text-center mt-4">
						<Text size="sm" c="dimmed">
							{t("configSwitcher.description")}
						</Text>
						<Button
							variant="subtle"
							onClick={onCreateStore}
							leftSection={<PlusIcon size={14} />}
							mt="xs"
						>
							{t("configSwitcher.createConfig")}
						</Button>
					</div>
				)}
			</div>

			<GLMDialog opened={glmOpen} onClose={() => setGlmOpen(false)} />
			<MiniMaxDialog opened={minimaxOpen} onClose={() => setMinimaxOpen(false)} />
			<KimiDialog opened={kimiOpen} onClose={() => setKimiOpen(false)} />
			<DeepSeekDialog opened={deepseekOpen} onClose={() => setDeepseekOpen(false)} />
		</div>
	);
}
