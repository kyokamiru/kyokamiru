import { notFound } from "next/navigation";

import { DeletePublisherButton } from "@/components/admin/delete-publisher-button";
import { PublisherForm } from "@/components/admin/publisher-form";
import { getAdminPublisher } from "@/lib/admin-queries";

import { updatePublisherAction } from "../actions";

export default async function EditPublisherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publisher = await getAdminPublisher(id);

  if (!publisher) {
    notFound();
  }

  const action = updatePublisherAction.bind(null, publisher.id, publisher.slug);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <p className="mb-1 text-sm font-semibold text-sky-300">EDIT PUBLISHER</p>
          <h1 className="text-balance text-3xl font-bold text-white">{publisher.name}</h1>
          <p className="mt-2 text-pretty text-sm text-slate-400">パブリッシャー情報と包括ガイドラインを編集します。</p>
        </div>
        <DeletePublisherButton id={publisher.id} slug={publisher.slug} name={publisher.name} />
      </header>
      <PublisherForm action={action} publisher={publisher} />
    </div>
  );
}
