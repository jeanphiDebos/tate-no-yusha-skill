<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\HttpFoundation\File\File;
use ApiPlatform\Core\Annotation\ApiResource;
use ApiPlatform\Core\Annotation\ApiFilter;
use ApiPlatform\Core\Annotation\ApiSubresource;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Core\Bridge\Doctrine\Orm\Filter\ExistsFilter;

/**
 * @ORM\Entity(repositoryClass="App\Repository\SkillRepository")
 * @ApiResource(attributes={
 *     "normalization_context"={"groups"={"skill"}}
 * })
 * @ApiFilter(OrderFilter::class, properties={"id", "name"})
 * @ApiFilter(SearchFilter::class, properties={
 *   "id": "exact",
 *   "name": "partial",
 *   "weapon.id": "exact",
 *   "weapon.name": "partial",
 *   "skillParent.id": "exact",
 *   "skillParent.name": "partial"
 * })
 * @ApiFilter(ExistsFilter::class, properties={"skillParent"})
 * 
 * https://api-platform.com/docs/core/filters/
 */
class Skill
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue(strategy="UUID")
     * @ORM\Column(type="guid", unique=true)
     * @Groups("skill")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Assert\NotBlank
     * @Groups("skill")
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups("skill")
     */
    private $description;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     * @Groups("skill")
     */
    private $image;

    /**
     * @var File
     */
    private $imageFile;

    /**
     * @ORM\Column(type="integer")
     * @Assert\NotBlank
     * @Groups("skill")
     */
    private $cost;

    /**
     * @ORM\Column(type="boolean")
     * @Groups("skill")
     */
    private $enable;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Weapon", inversedBy="skills")
     * @ORM\JoinColumn(nullable=false)
     * @Assert\NotBlank
     */
    private $weapon;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Skill", inversedBy="childSkill")
     * @ApiSubresource(maxDepth=1)
     */
    private $skillParent;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Skill", mappedBy="skillParent")
     * @ApiSubresource(maxDepth=1)
     * @Groups("skill")
     */
    private $childSkill;

    public function __construct()
    {
        $this->childSkill = new ArrayCollection();
        $this->enable     = false;
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getImageFile(): ?File
    {
        return $this->image ? new File($this->image) : $this->imageFile;
    }

    public function setImageFile(File $imageFile): self
    {
        $this->imageFile = $imageFile;

        return $this;
    }

    public function getCost(): ?int
    {
        return $this->cost;
    }

    public function setCost(int $cost): self
    {
        $this->cost = $cost;

        return $this;
    }

    public function getEnable(): ?bool
    {
        return $this->enable;
    }

    public function setEnable(bool $enable): self
    {
        $this->enable = $enable;

        return $this;
    }

    public function getWeapon(): ?Weapon
    {
        return $this->weapon;
    }

    public function setWeapon(?Weapon $weapon): self
    {
        $this->weapon = $weapon;

        return $this;
    }

    public function getSkillParent(): ?self
    {
        return $this->skillParent;
    }

    public function setSkillParent(?self $skillParent): self
    {
        $this->skillParent = $skillParent;

        return $this;
    }

    /**
     * @return Collection|self[]
     */
    public function getChildSkill(): Collection
    {
        return $this->childSkill;
    }

    public function addChildSkill(self $childSkill): self
    {
        if (!$this->childSkill->contains($childSkill)) {
            $this->childSkill[] = $childSkill;
            $childSkill->setSkillParent($this);
        }

        return $this;
    }

    public function removeChildSkill(self $childSkill): self
    {
        if ($this->childSkill->contains($childSkill)) {
            $this->childSkill->removeElement($childSkill);
            // set the owning side to null (unless already changed)
            if ($childSkill->getSkillParent() === $this) {
                $childSkill->setSkillParent(null);
            }
        }

        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return (string) $this->name;
    }
}
