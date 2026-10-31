-- Seed the design knowledge catalogue used by the interactive graph.
-- Safe to re-run; slugs are stable identifiers referenced by skill_assessments.
insert into public.knowledge_nodes(slug,title,category,description,difficulty) values
 ('k1','设计基础','基础能力','理解设计原则、视觉层级、构图与色彩体系。',2),
 ('k2','用户研究','研究能力','通过访谈、问卷和行为观察理解真实用户需求。',3),
 ('k3','信息架构','体验能力','组织内容结构、导航层级与用户任务路径。',3),
 ('k4','交互原型','体验能力','将任务流程转化为可验证的交互原型。',4),
 ('k5','视觉表达','设计表现','运用色彩、字体、图形和版式建立视觉语言。',4),
 ('k6','设计系统','系统能力','构建可复用组件、设计变量与跨端规范。',5),
 ('k7','可用性评估','验证能力','制定测试任务，观察用户行为并提出改进建议。',4),
 ('k8','AI交互设计','前沿能力','设计生成式AI产品的对话、反馈、纠错与信任机制。',3),
 ('k9','作品集表达','职业准备','用问题、过程、决策和结果讲清楚设计价值。',3)
on conflict(slug) do update set title=excluded.title,category=excluded.category,description=excluded.description,difficulty=excluded.difficulty;

insert into public.knowledge_edges(source_node_id,target_node_id,relation_type)
select a.id,b.id,'learning_next' from (values
 ('k1','k5'),('k1','k3'),('k2','k3'),('k3','k4'),('k4','k7'),
 ('k5','k6'),('k4','k8'),('k6','k9'),('k7','k9'),('k8','k9')
) as pairs(source_slug,target_slug)
join public.knowledge_nodes a on a.slug=pairs.source_slug
join public.knowledge_nodes b on b.slug=pairs.target_slug
on conflict(source_node_id,target_node_id,relation_type) do nothing;
